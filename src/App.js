import React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_USER_BY_USERNAME = gql`
  query($username: String!) {
    user(login: $username) {
      name
      url
      bio
      id
      viewerIsFollowing
    }
  }
`;

const FOLLOW_BY_ID = gql`
  mutation FollowUser($userId: ID!) {
    followUser(input: { userId: $userId }) {
      user {
        id
        viewerIsFollowing
      }
    }
  }
`;

const UNFOLLOW_BY_ID = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(input: { userId: $userId }) {
      user {
        id
        viewerIsFollowing
      }
    }
  }
`;

function App() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [confirmedSearchTerm, setConfirmedSearchTerm] = React.useState("");

  function handleSearch(event) {
    setSearchTerm(event.target.value);
  }

  function handleSubmitSearch(event) {
    setConfirmedSearchTerm(searchTerm);

    event.preventDefault();
  }

  return (
    <div>
      <h2>My Profile:</h2>
      <Profile username="rwieruch" />

      <hr />

      <Search
        value={searchTerm}
        onSearch={handleSearch}
        onSubmitSearch={handleSubmitSearch}
      >
        Search:{" "}
      </Search>

      <br />

      {confirmedSearchTerm && (
        <Profile username={confirmedSearchTerm} canFollow />
      )}
    </div>
  );
}

function Profile({ username, canFollow }) {
  const { loading, error, data: userData } = useQuery(GET_USER_BY_USERNAME, {
    variables: { username },
  });

  const [followById, { data: followData }] = useMutation(FOLLOW_BY_ID, {
    variables: { userId: userData?.user.id },
    optimisticResponse: {
      __typename: "Mutation",
      followUser: {
        user: {
          id: userData?.user.id,
          __typename: "User",
          viewerIsFollowing: true,
        },
      },
    },
  });

  const [unfollowById, { data: unfollowData }] = useMutation(UNFOLLOW_BY_ID, {
    variables: { userId: userData?.user.id },
    optimisticResponse: {
      __typename: "Mutation",
      unfollowUser: {
        user: {
          id: userData?.user.id,
          __typename: "User",
          viewerIsFollowing: false,
        },
      },
    },
  });

  if (loading) return <span>Loading ...</span>;
  if (error) return <span>Something went wrong ...</span>;

  return (
    <div>
      <span>
        Username: <a href={userData.user.url}>{userData.user.name}</a>
      </span>
      <span>Bio: {userData.user.bio}</span>
      {canFollow && (
        <span>
          <button
            type="button"
            onClick={
              userData.user.viewerIsFollowing ? unfollowById : followById
            }
          >
            {userData.user.viewerIsFollowing ? "Unfollow" : "Follow"}
          </button>
        </span>
      )}
    </div>
  );
}

function Search({ searchId, value, onSearch, onSubmitSearch, children }) {
  return (
    <form onSubmit={onSubmitSearch}>
      <label htmlFor={searchId}>{children}</label>
      <input type="text" id={searchId} value={value} onChange={onSearch} />

      <button type="submit">Search</button>
    </form>
  );
}

export default App;
