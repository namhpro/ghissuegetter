import { Octokit } from "octokit";
import * as fs from "fs";
import { marked } from 'marked';
import * as path from 'path';

export class GhiDumper {
  octokit: Octokit
  login: string
  repo: string

  constructor(repo: string) {
    this.repo = repo
    // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
    this.octokit = new Octokit({ auth: `...` });

  }

  async getAuth() {
    // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
    const { data: { login } } = await this.octokit.rest.users.getAuthenticated();
    this.login = login
  }

  async writeFullIssueContents() {
    // https://github.com/octokit/plugin-paginate-rest.js/#octokitpaginateiterator
    const iterator = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
      owner: this.login,
      repo: this.repo,
      per_page: 100,
      state: "all",
    });

    const outDir = path.join(__dirname, 'out')
    this._createOutDir(outDir)
    // iterate through each response
    for await (const { data: issues } of iterator) {
      for (const issue of issues) {

        const filename = path.join(outDir, `${String(issue.number).padStart(2, '0')}-${issue.title.replace(/[\/\?\=\*]/g, '_')}.html`)

        console.log("Issue #%d: %s", issue.number, issue.title);

        const wstream = fs.createWriteStream(filename, { flags: 'w' })
        wstream.on('close', () => {
          console.log('done')
        })

        this._writeTemplate(wstream, issue.title)
        wstream.write(`<h1>${issue.title}</h1>`)
        
        const html = marked.parse(issue.body);
        wstream.write(html)

        await this._getAllComments(wstream, issue.number)

        wstream.close()

      }
    }

  }

  async _getAllComments(wstream: fs.WriteStream, issueNumber: number) {
    const { data: commentsList } = await this.octokit.rest.issues.listComments({
      owner: this.login,
      repo: this.repo,
      issue_number: issueNumber,
    })
    console.log("writing comments")
    for (const comment of commentsList) {
      wstream.write("<br/>\n")
      wstream.write(`<hr/>\n`)
      wstream.write(`url:${comment.html_url}<br/>\n`)
      wstream.write(`created_at:${comment.created_at}, updated_at:${comment.updated_at}<br/><br/>\n`)
      wstream.write(marked.parse(comment.body))
      wstream.write("<br/>\n")
    }
  }

  async _writeTemplate(wstream: fs.WriteStream, title: string) {

    wstream.write('<!DOCTYPE html>\n')
    wstream.write('<head>\n')
    wstream.write('<meta charset="utf-8">\n')
    wstream.write('<meta name="viewport" content="width=device-width, initial-scale=1">\n')
    wstream.write(`<title>${title}</title>\n`)
    wstream.write('<link rel="stylesheet" type="text/css" href="styles.css" media="screen" />\n')
    wstream.write('</head>\n')
    wstream.write('<body>\n')

  }
  async _closeTemplate(wstream: fs.WriteStream) {

    wstream.write('\n')
    wstream.write('</body>\n')
    wstream.write('</html>\n')

  }

  async _createOutDir(path: string){
    let accessRes
    try{
      accessRes = await fs.promises.access(path)
    }catch(err){
      if(err.errno == -4058){
        // not created output directory yet
        fs.promises.mkdir(path)
      }
    }
    
  }
}