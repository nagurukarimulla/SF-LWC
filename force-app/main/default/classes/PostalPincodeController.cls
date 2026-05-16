public with sharing class PostalPincodeController {

    @AuraEnabled(cacheable=true)
    public static List<Object> searchByPincode(String pincode) {

        if(String.isBlank(pincode)) {
            throw new AuraHandledException('Please enter PIN Code');
        }

        String endpoint = 'https://api.postalpincode.in/pincode/' +
                          EncodingUtil.urlEncode(pincode, 'UTF-8');

        Http http = new Http();
        HttpRequest req = new HttpRequest();

        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setTimeout(60000);

        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200) {

            List<Object> responseList =
                (List<Object>) JSON.deserializeUntyped(res.getBody());

            if(responseList != null && !responseList.isEmpty()) {

                Map<String, Object> responseMap =
                    (Map<String, Object>) responseList[0];

                String status = (String) responseMap.get('Status');

                if(status == 'Success') {
                    return (List<Object>) responseMap.get('PostOffice');
                } else {
                    throw new AuraHandledException(
                        (String) responseMap.get('Message')
                    );
                }
            }
        }

        throw new AuraHandledException('Unable to fetch data');
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> searchByPostOffice(String postOfficeName) {

        if(String.isBlank(postOfficeName)) {
            throw new AuraHandledException('Please enter Post Office Name');
        }

        String endpoint = 'https://api.postalpincode.in/postoffice/' +
                          EncodingUtil.urlEncode(postOfficeName, 'UTF-8');

        Http http = new Http();
        HttpRequest req = new HttpRequest();

        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setTimeout(60000);

        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200) {

            List<Object> responseList =
                (List<Object>) JSON.deserializeUntyped(res.getBody());

            if(responseList != null && !responseList.isEmpty()) {

                Map<String, Object> responseMap =
                    (Map<String, Object>) responseList[0];

                String status = (String) responseMap.get('Status');

                if(status == 'Success') {
                    return (List<Object>) responseMap.get('PostOffice');
                } else {
                    throw new AuraHandledException(
                        (String) responseMap.get('Message')
                    );
                }
            }
        }

        throw new AuraHandledException('Unable to fetch data');
    }
}