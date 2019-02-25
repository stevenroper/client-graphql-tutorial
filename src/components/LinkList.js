import React from 'react';
import Link from './Link';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`;

class LinkList extends React.Component {
  render() {
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Oops, there was a problem.</div>;

          return (
            <div>
              {data.feed.links.map(link => <Link key={link.id} link={link} />)}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;