public with sharing class GitHubUserController {

    @AuraEnabled(cacheable=true)
    public static GitHubUserWrapper fetchGitHubUser(String username) {

        if(String.isBlank(username)){
            throw new AuraHandledException('GitHub username is required');
        }

        Http http = new Http();
        HttpRequest req = new HttpRequest();

        String endpoint = 'https://api.github.com/users/' +
                          EncodingUtil.urlEncode(username, 'UTF-8');

        req.setEndpoint(endpoint);
        req.setMethod('GET');

        req.setHeader('Accept', 'application/vnd.github+json');
        req.setHeader('User-Agent', 'Salesforce');

        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200){

            Map<String, Object> responseMap =
                (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

            GitHubUserWrapper wrapper = new GitHubUserWrapper();

            wrapper.login = (String) responseMap.get('login');
            wrapper.name = (String) responseMap.get('name');
            wrapper.bio = (String) responseMap.get('bio');
            wrapper.company = (String) responseMap.get('company');
            wrapper.location = (String) responseMap.get('location');
            wrapper.blog = (String) responseMap.get('blog');
            wrapper.publicRepos =
                Integer.valueOf(String.valueOf(responseMap.get('public_repos')));
            wrapper.followers =
                Integer.valueOf(String.valueOf(responseMap.get('followers')));
            wrapper.following =
                Integer.valueOf(String.valueOf(responseMap.get('following')));
            wrapper.avatarUrl = (String) responseMap.get('avatar_url');
            wrapper.profileUrl = (String) responseMap.get('html_url');

            return wrapper;

        } else if(res.getStatusCode() == 404){
            throw new AuraHandledException('GitHub user not found');
        } else {
            throw new AuraHandledException(
                'GitHub API Error : ' + res.getStatus()
            );
        }
    }

    public class GitHubUserWrapper {

        @AuraEnabled public String login;
        @AuraEnabled public String name;
        @AuraEnabled public String bio;
        @AuraEnabled public String company;
        @AuraEnabled public String location;
        @AuraEnabled public String blog;
        @AuraEnabled public Integer publicRepos;
        @AuraEnabled public Integer followers;
        @AuraEnabled public Integer following;
        @AuraEnabled public String avatarUrl;
        @AuraEnabled public String profileUrl;
    }
}