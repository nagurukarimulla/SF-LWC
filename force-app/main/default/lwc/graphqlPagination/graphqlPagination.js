import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/graphql';

const PAGE_SIZE = 5;

export default class GraphqlPagination extends LightningElement {

    afterCursor = null;
    pageNumber = 1;

    @wire(graphql, {
        query: gql`
            query paginatedContacts($after: String, $pageSize: Int!) {
                uiapi {
                    query {
                        Contact(
                            first: $pageSize,
                            after: $after,
                            orderBy: { Name: { order: ASC } }
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
                            pageInfo {
                                endCursor
                                hasNextPage
                            }
                        }
                    }
                }
            }
        `,
        variables: '$variables'
    })
    contacts;

    get variables() {
        return {
            after: this.afterCursor,
            pageSize: PAGE_SIZE
        };
    }

    get contactList() {
        return this.contacts?.data?.uiapi?.query?.Contact?.edges || [];
    }

    get pageInfo() {
        return this.contacts?.data?.uiapi?.query?.Contact?.pageInfo;
    }

    get isLastPage() {
        return !this.pageInfo?.hasNextPage;
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    handleNext() {
        if (this.pageInfo?.hasNextPage) {
            this.afterCursor = this.pageInfo.endCursor;
            this.pageNumber++;
        }
    }

    handleReset() {
        this.afterCursor = null;
        this.pageNumber = 1;
    }
}