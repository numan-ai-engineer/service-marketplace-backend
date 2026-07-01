import { useContext } from "react";
import { Container, Card } from "react-bootstrap";
import UserContext from "../context/UserContext";

function Profile() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <Container className="mt-5">
      <Card className="shadow p-4">
        <h2 className="mb-4">My Profile</h2>

<h5>
  <strong>Username:</strong> {user.username}
</h5>

<h5 className="mt-3">
  <strong>Phone:</strong> {user.phone}
</h5>

<h5 className="mt-3">
  <strong>Role:</strong> {user.role}
</h5>
      </Card>
    </Container>
  );
}

export default Profile;