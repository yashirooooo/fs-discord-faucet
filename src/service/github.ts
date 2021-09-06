import axios from 'axios';
import { Octokit } from 'octokit';
import { isValidAddr } from '..';
import { githubUserName, githubRepoName, githubOauthToken } from '../consts'
import { validateGithub } from '../util';
import _ from 'lodash';

export interface GithubApplicant {
    address: string;
    githubId: string;
    githubName: string
}

// basic auth
const octokit = new Octokit({ auth: githubOauthToken });

export const parseIssue = async (issueId: number): Promise<GithubApplicant | string> => {
    let remoteIssue = await octokit.rest.issues.get({
        owner: githubUserName,
        repo: githubRepoName,
        issue_number: issueId
    })
    const issueData = remoteIssue.data;
    const issueTittle = issueData.title;
    const issueBody = issueData.body;
    if (isValidAddr(issueTittle) || isValidAddr(issueBody as string)) {
        const creatorId = issueData.user?.id;
        try {
            const userInfo = await axios({
                method: 'get',
                url: `https://api.github.com/user/${creatorId}`
            });
            const isValid = validateGithub(Date.parse(userInfo.data.created_at));
            const isStarred = await maybeStarred(creatorId as number);
            if (isValid) {
                if (isStarred) {
                    return {
                        address: issueTittle || issueBody as unknown as string,
                        githubId: creatorId as unknown as string,
                        githubName: userInfo.data.login
                    }
                } else {
                    return 'You do not starred the specified repository';
                }
            } else {
                return "Your github account application is less than 6 months old";
            }
        } catch (error) {
            return error.message;
        }
    } else {
        return 'Illegal issue format'
    }
}

export const maybeStarred = async (githubId: number) => {
    const result = await axios({
        method: 'get',
        url: `https://api.github.com/repos/${githubUserName}/${githubRepoName}/stargazers`
    });

    const starInfo = result.data as any[];
    const index = _.findIndex(starInfo, (info) => {
        return info.id == githubId
    })

    return index >= 0;
}