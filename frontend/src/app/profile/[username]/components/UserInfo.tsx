import Image from 'next/image';

type UserInfoProps = {
  profile: Profile;
  isProfileOfUser: boolean;
}

export default function UserInfo({
  profile,
  isProfileOfUser,
}: UserInfoProps) {
  const { bio, image: imageUrl, username, } = profile;
  
  return (
    <div className="user-info">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <Image 
              src={imageUrl} 
              className="user-img" 
              width={100} 
              height={100} 
              alt={`User image of ${username}`} 
            />
            <h4>{username}</h4>
            <p>{bio ?? 'This user does not have bio'}</p>
            {
              !isProfileOfUser ? 
                <button className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-plus-round"></i>
                  &nbsp; Follow {username}
                </button> :
                null
            }
            {
              isProfileOfUser ? 
                <button className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-gear-a"></i>
                  &nbsp; Edit Profile Settings
                </button> :
                null
            }
          </div>
        </div>
      </div>
    </div>
  )
}