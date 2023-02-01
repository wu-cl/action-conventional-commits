import get from "lodash.get";
import got from "got";

type Commit = {
    message: string;
};

const extractCommits = async (context, core): Promise<Commit[]> => {
    // For "push" events, commits can be found in the "context.payload.commits".
    const pushCommits = Array.isArray(get(context, "payload.commits"));
    if (pushCommits) {
        return context.payload.commits;
    }

    // For PRs, we need to get a list of commits via the GH API:
    const prCommitsUrl = get(context, "payload.pull_request.commits_url");
    if (prCommitsUrl) {
        try {
            const { body } = await got.get(prCommitsUrl, {
                responseType: "json",
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": "token " + core.getInput('GITHUB_TOKEN')
                }
            });

            if (Array.isArray(body)) {
                return body.map((item) => item.commit);
            }
            return [];
        } catch {
            return [];
        }
    }

    return [];
};

export default extractCommits;
