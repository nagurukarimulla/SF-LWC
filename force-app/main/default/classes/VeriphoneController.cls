public with sharing class VeriphoneController {

    @AuraEnabled(cacheable=false)
    public static String verifyPhone(String phoneNumber) {

        Http http = new Http();
        HttpRequest req = new HttpRequest();

        String apiKey = 'D9AB6DC870C046EA94032CB2B1446025';

        req.setEndpoint(
            'https://api.veriphone.io/v2/verify?phone=' +
            EncodingUtil.urlEncode(phoneNumber, 'UTF-8')
        );

        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + apiKey);

        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200){
            return res.getBody();
        }

        throw new AuraHandledException(
            'API Error : ' + res.getBody()
        );
    }
}