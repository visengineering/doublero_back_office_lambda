const fs = require('fs');

const testTag = str => {
  const tagMatcher = new RegExp(/([A-Z]{2,}-\d+)/g);
  const matched = str.match(tagMatcher);
  return matched && matched[0];
};

const messageFile = '.git/COMMIT_EDITMSG';
const message = fs.readFileSync(messageFile, {encoding: 'utf-8'});
const messageTitle = message.split('\n')[0];
const branchName = require('child_process')
    .execSync('git rev-parse --abbrev-ref HEAD', {encoding: 'utf-8'})
    .split('\n')[0];

const issueBranchName =
    branchName === 'development' ||
    branchName === 'stage' ||
    branchName === 'master' ||
    testTag(branchName);
const issueMessageTitle =
    testTag(messageTitle) ||
    messageTitle.includes('Merge remote-tracking branch');

if (issueBranchName && issueMessageTitle) {
  // Apply the issue tag to message title
  const messageLines = message.split('\n');
  messageLines[0] = `${messageTitle}`;
  fs.writeFileSync(messageFile, messageLines.join('\n'), {encoding: 'utf-8'});
  console.log(`New message title: ${messageLines[0]}`);
} else {
  console.log('Branch name or message title must contain Jira ticket number');
  process.exit(1);
}
