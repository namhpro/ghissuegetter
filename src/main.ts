import { GhiDumper } from './ghidumper';

(async () => {

    const gdumper = new GhiDumper('polaris_server')
    await gdumper.getAuth()
    await gdumper.writeFullIssueContents()


    // 
    // const resp = await octokit.rest.issues.get({
    //     owner: login,
    //     repo: "polaris_server",
    //     issue_number: 10,
    // })
    // console.log(`issue body=${resp.data.body}`)
})()
