import axios from 'axios';
import console from 'console';
import { Octokit } from 'octokit';
import { isValidAddr } from '..';
import { githubUserName, githubRepoName, githubOauthToken } from '../consts'
import { validateGithub } from '../util';
const GitHub = require('github-api');

// basic auth
const octokit = new Octokit({ auth: githubOauthToken });

export const parseIssue = async (issueId: number) => {
    let remoteIssue = await octokit.rest.issues.get({
        owner: githubUserName,
        repo: githubRepoName,
        issue_number: issueId
    })
    // const issue = await remoteIssues.getIssue(issueId);
    const issueData = remoteIssue.data;
    console.log('issueData', issueData);
    const issueTittle = issueData.title;
    const issueBody = issueData.body;
    if (isValidAddr(issueTittle) || isValidAddr(issueBody as string)) {
        
    }
    const creatorId = issueData.user?.id;
    try {
        const userInfo = await axios({
            method: 'get',
            url: `https://api.github.com/user/${creatorId}`
        }); 
        console.log('result', userInfo)
        const isValid = validateGithub(Date.parse(userInfo.data.created_at));
        console.log('isValid', isValid)
        if (isValid) {
            return {
                address: issueTittle || issueBody,
                applicant: creatorId,
                githubName: userInfo.data.login
            }
        } else {
            
        }
    } catch (error) {
        
    }
}