import { getJwtToken } from "@/app/lib/users/jwtToken";
import { useEffect, useState } from "react"
import NavLink from "./NavLink";
import { customFetch } from "@/app/lib/api/customFetch";

type UseNavLinkProps = {}

export default function UserNavLink({}: UseNavLinkProps) {
  const [username, setUsername] = useState('Haha');
  const [imageUrl, setImageUrl] = useState('https://api.realworld.io/images/smiley-cyrus.jpeg');

  const authToken = getJwtToken();

  useEffect(() => {
    customFetch('/api/user')
      .then((response) => response.json())
      .then(console.info);
  }, [authToken]);

  return (
    <NavLink
      key="/profile"
      link={{
        href: '/profile',
        children: (
          <>
            <img src={imageUrl} className="user-pic" />
            {username}
          </>
        ),
        protectedLink: true
      }}
      isActive={false}
    />
  )
}