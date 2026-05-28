import { LightningElement, wire, api } from "lwc";
import { gql, graphql } from "lightning/graphql";
import Id from "@salesforce/user/Id";

export default class MultiObjectGraphQL extends LightningElement {

    @api recordId;

    queryError;
    contacts = [];
    users = [];

    userId = Id;

    isLoading = true;

    @wire(graphql, {
        query: "$contactQuery",
        variables: "$queryData",
    })
    recordsQueryResult({ data, errors }) {

        this.isLoading = false;

        if (data) {

            // Contact Records
            this.contacts =
                data.uiapi.query.Contact.edges.map(
                    (edge) => edge.node
                );

            // User Records
            this.users =
                data.uiapi.query.User.edges.map(
                    (edge) => edge.node
                );

            this.queryError = undefined;
        }

        if (errors) {
            this.queryError = errors;
            console.error(JSON.stringify(errors));
        }
    }

    get contactQuery() {

        return gql`

            query contactsOnAccount(
                $recordId: ID!,
                $userId: ID!
            ) {

                uiapi {
                    query {

                        Contact(
                            where: {
                                AccountId: {
                                    eq: $recordId
                                }
                            }
                        ) {
                            edges {
                                node {
                                    Id

                                    Name {
                                        value
                                    }

                                    Email {
                                        value
                                    }

                                    Phone {
                                        value
                                    }
                                }
                            }
                        }

                        User(
                            where: {
                                Id: {
                                    eq: $userId
                                }
                            }
                        ) {
                            edges {
                                node {

                                    Id

                                    Name {
                                        value
                                    }

                                    Email {
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
    }

    get queryData() {

        return {
            recordId: this.recordId,
            userId: this.userId,
        };
    }

    get hasContacts() {
        return this.contacts.length > 0;
    }

    get hasUsers() {
        return this.users.length > 0;
    }
}