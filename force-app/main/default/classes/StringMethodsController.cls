/**
 * @description Apex controller for String Methods LWC demo
 */
public with sharing class StringMethodsController {
    
    /**
     * @description Demonstrates all String methods with examples
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> demonstrateStringMethods(String inputText, String searchText) {
        Map<String, Object> result = new Map<String, Object>();
        
        // If no input provided, use default
        if (String.isBlank(inputText)) {
            inputText = '  Hello World from Salesforce  ';
        }
        if (String.isBlank(searchText)) {
            searchText = 'World';
        }
        
        //=========================================================================
        // 1. BASIC STRING OPERATIONS
        //=========================================================================
        Map<String, Object> basicOps = new Map<String, Object>();
        basicOps.put('original', inputText);
        basicOps.put('length', inputText.length());
        basicOps.put('trim', inputText.trim());
        basicOps.put('lowerCase', inputText.toLowerCase());
        basicOps.put('upperCase', inputText.toUpperCase());
        basicOps.put('charAt2', String.valueOf(inputText.charAt(2)));
        basicOps.put('chars', inputText.getChars());
        result.put('basicOps', basicOps);
        
        //=========================================================================
        // 2. COMPARISON METHODS
        //=========================================================================
        Map<String, Object> comparison = new Map<String, Object>();
        String str1 = 'Hello';
        String str2 = 'hello';
        String str3 = 'Hello World';
        
        comparison.put('equals', str1.equals(str2));
        comparison.put('equalsIgnoreCase', str1.equalsIgnoreCase(str2));
        comparison.put('compareTo', str1.compareTo(str3));
        comparison.put('contains', inputText.contains(searchText));
        comparison.put('containsIgnoreCase', inputText.containsIgnoreCase(searchText));
        comparison.put('startsWith', inputText.startsWith('  Hello'));
        comparison.put('endsWith', inputText.endsWith('  '));
        result.put('comparison', comparison);
        
        //=========================================================================
        // 3. SEARCH METHODS
        //=========================================================================
        Map<String, Object> search = new Map<String, Object>();
        search.put('indexOf', inputText.indexOf(searchText));
        search.put('lastIndexOf', inputText.lastIndexOf('o'));
        search.put('indexOfAny', inputText.indexOfAny('xyz'));
        search.put('indexOfDifference', inputText.indexOfDifference('  Hello World'));
        result.put('search', search);
        
        //=========================================================================
        // 4. SUBSTRING EXTRACTION
        //=========================================================================
        Map<String, Object> substring = new Map<String, Object>();
        String extractStr = 'Salesforce.com';
        
        substring.put('substring', extractStr.substring(4));
        substring.put('left', extractStr.left(4));
        substring.put('right', extractStr.right(3));
        substring.put('mid', extractStr.mid(4, 3));
        substring.put('substringAfter', extractStr.substringAfter('.'));
        substring.put('substringBefore', extractStr.substringBefore('.'));
        substring.put('substringBetween', extractStr.substringBetween('f', '.'));
        result.put('substring', substring);
        
        //=========================================================================
        // 5. STRING MANIPULATION
        //=========================================================================
        Map<String, Object> manipulation = new Map<String, Object>();
        String manipStr = 'Hello World';
        
        manipulation.put('replace', manipStr.replace('World', 'Salesforce'));
        manipulation.put('replaceAll', manipStr.replaceAll('[aeiou]', '*'));
        manipulation.put('replaceFirst', manipStr.replaceFirst('[aeiou]', '*'));
        manipulation.put('remove', manipStr.remove('l'));
        manipulation.put('reverse', manipStr.reverse());
        manipulation.put('capitalize', manipStr.capitalize());
        manipulation.put('swapCase', manipStr.swapCase());
        result.put('manipulation', manipulation);
        
        //=========================================================================
        // 6. PADDING & CENTERING
        //=========================================================================
        Map<String, Object> padding = new Map<String, Object>();
        String padStr = 'Hello';
        
        padding.put('leftPad', padStr.leftPad(10));
        padding.put('leftPadStar', padStr.leftPad(10, '*'));
        padding.put('rightPad', padStr.rightPad(10));
        padding.put('rightPadStar', padStr.rightPad(10, '*'));
        padding.put('center', padStr.center(11));
        result.put('padding', padding);
        
        //=========================================================================
        // 7. WHITESPACE HANDLING
        //=========================================================================
        Map<String, Object> whitespace = new Map<String, Object>();
        String messyStr = '  extra   spaces   here  ';
        
        whitespace.put('containsWhitespace', padStr.containsWhitespace());
        whitespace.put('isWhitespace', '   '.isWhitespace());
        whitespace.put('deleteWhitespace', messyStr.deleteWhitespace());
        whitespace.put('normalizeSpace', messyStr.normalizeSpace());
        whitespace.put('trim', messyStr.trim());
        result.put('whitespace', whitespace);
        
        //=========================================================================
        // 8. VALIDATION METHODS
        //=========================================================================
        Map<String, Object> validation = new Map<String, Object>();
        
        validation.put('isAlpha', 'HelloWorld'.isAlpha());
        validation.put('isAlphaNum', 'Hello123'.isAlphanumeric());
        validation.put('isNumeric', '12345'.isNumeric());
        validation.put('isAllLowerCase', 'hello'.isAllLowerCase());
        validation.put('isAllUpperCase', 'HELLO'.isAllUpperCase());
        validation.put('isBlank', String.isBlank('   '));
        validation.put('isEmpty', String.isEmpty(''));
        result.put('validation', validation);
        
        //=========================================================================
        // 9. STATIC UTILITY METHODS
        //=========================================================================
        Map<String, Object> staticUtils = new Map<String, Object>();
        
        staticUtils.put('join', String.join(new List<String>{'A','B','C'}, ','));
        staticUtils.put('format', String.format('Hello {0}, age {1}', 
                        new List<Object>{'John', 30}));
        staticUtils.put('valueOf', String.valueOf(123.45));
        staticUtils.put('fromCharArray', String.fromCharArray(new Integer[]{72,101,108,108,111}));
        result.put('staticUtils', staticUtils);
        
        //=========================================================================
        // 10. ESCAPE/UNESCAPE METHODS
        //=========================================================================
        Map<String, Object> escape = new Map<String, Object>();
        String specialStr = '"Hello" & \'World\'';
        String htmlStr = '<div class="test">Hello</div>';
        
        escape.put('escapeJava', specialStr.escapeJava());
        escape.put('escapeHtml4', '<tag>'.escapeHtml4());
        escape.put('stripHtmlTags', htmlStr.stripHtmlTags());
        escape.put('escapeCsv', 'Salesforce, Inc.'.escapeCsv());
        escape.put('escapeSingleQuotes', String.escapeSingleQuotes('O\'Reilly'));
        result.put('escape', escape);
        
        //=========================================================================
        // 11. REPEAT & ABBREVIATE
        //=========================================================================
        Map<String, Object> repeat = new Map<String, Object>();
        
        repeat.put('repeat', 'Hi'.repeat(3));
        repeat.put('repeatWithSep', 'Hi'.repeat('-', 3));
        repeat.put('abbreviate', 'Hello World'.abbreviate(8));
        result.put('repeat', repeat);
        
        //=========================================================================
        // 12. SPLIT METHODS
        //=========================================================================
        Map<String, Object> split = new Map<String, Object>();
        String csvStr = 'apple,banana,orange,grape';
        
        split.put('split', csvStr.split(','));
        split.put('splitByType', 'Hello123World'.splitByCharacterType());
        split.put('splitByCamelCase', 'helloWorldTest'.splitByCharacterTypeCamelCase());
        result.put('split', split);
        
        //=========================================================================
        // 13. DISTANCE & DIFFERENCE
        //=========================================================================
        Map<String, Object> distance = new Map<String, Object>();
        
        distance.put('difference', 'Hello World'.difference('Hello Salesforce'));
        distance.put('levenshtein', 'Hello World'.getLevenshteinDistance('Hello Salesforce'));
        distance.put('commonPrefix', String.getCommonPrefix(
            new List<String>{'PreFix1', 'PreFix2', 'PreFiy3'}));
        result.put('distance', distance);
        
        //=========================================================================
        // 14. COUNT METHODS
        //=========================================================================
        Map<String, Object> count = new Map<String, Object>();
        String countStr = 'Hello Hello Hello';
        
        count.put('countMatches', countStr.countMatches('Hello'));
        count.put('codePointCount', 'Hello'.codePointCount(0, 3));
        result.put('count', count);
        
        return result;
    }
    
    /**
     * @description Get practical examples
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getPracticalExamples() {
        Map<String, Object> examples = new Map<String, Object>();
        
        // Email parsing
        String email = 'user.name@company.com';
        Map<String, String> emailParse = new Map<String, String>();
        emailParse.put('full', email);
        emailParse.put('username', email.substringBefore('@'));
        emailParse.put('domain', email.substringAfter('@'));
        examples.put('email', emailParse);
        
        // CSV parsing
        String csvLine = 'John,Doe,30,New York';
        examples.put('csv', csvLine.split(','));
        
        // Name formatting
        Map<String, String> nameFormat = new Map<String, String>();
        nameFormat.put('firstName', 'john');
        nameFormat.put('lastName', 'DOE');
        nameFormat.put('formatted', 'john'.capitalize() + ' ' + 'DOE'.uncapitalize());
        examples.put('name', nameFormat);
        
        // Phone cleaning
        String phone = '(555) 123-4567';
        String cleanPhone = phone.deleteWhitespace()
                                  .replace('(', '')
                                  .replace(')', '')
                                  .replace('-', '');
        examples.put('phone', new Map<String, String>{
            'original' => phone,
            'cleaned' => cleanPhone
        });
        
        // URL parsing
        String url = 'https://www.salesforce.com/products/?view=all';
        Map<String, String> urlParse = new Map<String, String>();
        urlParse.put('full', url);
        urlParse.put('protocol', url.substringBefore('://'));
        urlParse.put('domain', url.substringBetween('://', '/'));
        urlParse.put('path', url.substringAfter('.com').substringBefore('?'));
        urlParse.put('params', url.substringAfter('?'));
        examples.put('url', urlParse);
        
        return examples;
    }
}