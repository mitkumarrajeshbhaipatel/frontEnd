import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext<any>(null);

export const ProfileProvider = ({ children }: any) => {
  const [profile, setProfile] = useState<any>(null);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
