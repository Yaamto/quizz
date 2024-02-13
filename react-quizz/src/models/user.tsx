import { Socket } from "socket.io-client";

interface User {
    id: string;
    username?: string;
    avatar?: string;
    point?: number;
  }

  export default User;