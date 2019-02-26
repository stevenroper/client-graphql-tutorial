import React, { Fragment } from 'react';
import Link from './Link';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;
const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;
const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;


class LinkList extends React.Component {

  getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new');
    if (isNewPage) return data.feed.links;

    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks.slice(0, 10);
  }

  getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { first, skip, orderBy };
  }

  nextPage = data => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  }

  previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  }
  
  updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });

    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: FEED_QUERY, data });
  }

  subscribeToNewLinks = async subscribeToMore => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename,
          },
        });
      },
    });
  }

  subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  }

  render() {
    return (
      <Query query={FEED_QUERY} variables={this.getQueryVariables()}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Oops, there was a problem.</div>;

          this.subscribeToNewLinks(subscribeToMore);
          this.subscribeToNewVotes(subscribeToMore);

          const linksToRender = this.getLinksToRender(data);
          const isNewPage = this.props.location.pathname.includes('new');
          const { page } = this.props.match.params;
          const pageIndex = page
            ? (page - 1) * LINKS_PER_PAGE
            : 0;

          return (
            <Fragment>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index + pageIndex}
                  updateStoreAfterVote={this.updateCacheAfterVote}
                />
              ))}
              {isNewPage && (
                <div className='flex ml4 mv3 gray'>
                  <div className='pointer mr2' onClick={this.previousPage}>Previous</div>
                  <div className='pointer' onClick={() => this.nextPage(data)}>Next</div>
                </div>
              )}
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;