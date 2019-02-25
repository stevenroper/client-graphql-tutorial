import React from 'react'

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

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
      <Mutation mutation={POST_MUTATION} variables={{ description, url }}>
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