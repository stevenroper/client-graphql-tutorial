import React from 'react'

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { LINKS_PER_PAGE } from '../constants';
import { FEED_QUERY } from './LinkList';
const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;


class CreateLink extends React.Component {
  state = {
    description: '',
    url: '',
  };

  render() {
    const { description, url } = this.state;

    return (
      <Mutation
        mutation={POST_MUTATION}
        variables={{ description, url }}
        onCompleted={() => this.props.history.push('/new/1')}
        update={(store, { data: { post } }) => {
          const first = LINKS_PER_PAGE
          const skip = 0
          const orderBy = 'createdAt_DESC'
          const data = store.readQuery({
            query: FEED_QUERY,
            variables: { first, skip, orderBy }
          })
          data.feed.links.unshift(post)
          store.writeQuery({
            query: FEED_QUERY,
            data,
            variables: { first, skip, orderBy }
          })
        }}
      >
        {postMutation => (
          <form onSubmit={e => {
            e.preventDefault();
            postMutation(e);
          }}>
            <div className='flex flex-column mt3'>
              <input
                className='mb2'
                value={description}
                onChange={e => this.setState({ description: e.target.value })}
                type='text'
                placeholder='Desciption for the link'
              />
              <input
                className='mb2'
                value={url}
                onChange={e => this.setState({ url: e.target.value })}
                type='text'
                placeholder='Link URL'
              />
            </div>
            <button type='submit'>Submit</button>
          </form>
        )}
      </Mutation>
    );
  }
}

export default CreateLink;