import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/graphql';

export default class Concept_caseGraphQL extends LightningElement {

    cases;
    errors;

    @wire(graphql, {
        query: gql`
            query GetCases {
                uiapi {
                    query {
                        Case(first: 5) {
                            edges {
                                node {
                                    Id
                                    
                                    CaseNumber {
                                        value
                                    }

                                    Subject {
                                        value
                                    }

                                    Status {
                                        value
                                    }

                                    Priority {
                                        value
                                    }

                                    CreatedDate {
                                        value
                                    }

                                    Account {
                                        Name {
                                            value
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `
    })
    wiredCases({ data, errors }) {

        if (data) {
            // Add null safety checks for nested properties
            if (data.uiapi && data.uiapi.query && data.uiapi.query.Case && data.uiapi.query.Case.edges) {
                this.cases = data.uiapi.query.Case.edges.map(edge => edge.node);
                this.errors = undefined;

                console.log('Cases => ',
                    JSON.stringify(this.cases, null, 2)
                );
            } else {
                // Data exists but structure is unexpected
                console.error('Unexpected data structure => ', JSON.stringify(data));
                this.errors = [{ message: 'Unexpected data structure from GraphQL' }];
                this.cases = undefined;
            }
        }

        if (errors) {
            this.errors = errors;
            this.cases = undefined;
            console.error('GraphQL Errors => ',
                JSON.stringify(errors)
            );
        }
    }
}