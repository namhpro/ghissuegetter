import { Octokit, App } from "octokit";


(async () => {


    // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
    const octokit = new Octokit({ auth: `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` });

    // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
    const { data: { login } } = await octokit.rest.users.getAuthenticated();

    // gh api repos/namhpro/my_server/issues/10
    console.log("Hello, %s", login);
    octokit.rest.users.getAuthenticated();


    const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
        owner: login,
        repo: "polaris_server",
        per_page: 100,
    });

    // iterate through each response
    for await (const { data: issues } of iterator) {
        for (const issue of issues) {
            console.log("Issue #%d: %s", issue.number, issue.title);
            console.log("Issue Body: %s", issue.body);
        }
    }


    // 
    const resp = await octokit.rest.issues.get({
        owner: login,
        repo: "polaris_server",
        issue_number: 10,
    })
    console.log(`issue body=${resp.data.body}`)
})()
