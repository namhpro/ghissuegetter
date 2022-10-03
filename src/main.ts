import { GhiDumper, IssuePartly } from './ghidumper';

(async () => {

    const gdumper = new GhiDumper('polaris_server')
    await gdumper.getAuth()
    await gdumper.writeFullIssueContents()


    // const gdumper2 = new GhiDumper('my-repo2')
    // await gdumper2.getAuth()
    // const { data: issue } = await gdumper2.getAIssue(598)
    // await gdumper2.writeAIssue(issue as IssuePartly, './')

})()
