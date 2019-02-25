import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { timeDifferenceForDate } from '../utils';

import { AUTH_TOKEN } from '../constants';

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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

class Link extends React.Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);
    const { link } = this.props;

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <Mutation mutation={VOTE_MUTATION} variables={{ linkId: link.id }}>
              {voteMutation => (
                <div className="ml1 gray f11" style={{ cursor: 'pointer' }} onClick={voteMutation}>
                  ▲
                </div>
              )}
            </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            {link.description} ({link.url})
          </div>
          <div className="f6 lh-copy gray">
            {`${link.votes.length} votes | by ${link.postedBy ? link.postedBy.name : 'Unknown'} `}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        </div>
      </div>
    );
  }
}

export default Link;