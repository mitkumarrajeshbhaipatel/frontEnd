import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyMatches } from '../services/matchmakingService'; // Import your data fetching function
import { getSessionByMatch } from '../services/sessionService'; // Import your session fetching function
import { getNearbyUsers } from '../services/locationService'; // Import your location service
import { reverseGeocode } from '../utils/reverseGeocode'; // Helper function for reverse geocoding

interface Profile {
  user_id: string;
  name?: string;
  average_rating?: number;
  [key: string]: any;
}

interface Session {
  session_id: string;
  requester_id: string;
  helper_id: string;
  match_id: string;
  status: 'created' | 'started' | 'completed' | 'cancelled' | 'end';
  location: {
    lat: number;
    lng: number;
  };
  created_at: string;
  check_in_time?: string;
  check_out_time?: string;
  address?: string; // reverse geocoded address
  requester_profile?: Profile;
  helper_profile?: Profile;
  [key: string]: any;
}

interface SessionContextProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  updateSessionStatusLocally: (id: string, status: Session['status']) => void;
  updateSessionAddress: (id: string, address: string) => void;
  updateSessionProfiles: (id: string, profiles: { requester?: Profile; helper?: Profile }) => void;
  fetchSessions: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = async (userId: string) => {
    try {
      const matches = await getMyMatches(userId);
      const active = matches.filter((m: any) => m.status === 'accepted');
      const sessionPromises = active.map((match: any) => getSessionByMatch(match.match_id));
      const sessionResults = await Promise.all(sessionPromises);
      const validSessions = sessionResults.filter((s) => s && ['created', 'started', 'completed', 'cancelled'].includes(s.status));
      setSessions(validSessions);

      const nearbyProfiles = await getNearbyUsers(userId, 5);
      const profileMap: Record<string, any> = {};
      nearbyProfiles.forEach((u: any) => {
        if (u.profile) profileMap[u.user_id] = u.profile;
      });

      await Promise.all(
        validSessions.map(async (s) => {
          if (!s.address) {
            const address = await reverseGeocode(s.location.lat, s.location.lng);
            updateSessionAddress(s.session_id, address);
          }

          const requesterProfile = profileMap[s.requester_id];
          const helperProfile = profileMap[s.helper_id];

          if (requesterProfile || helperProfile) {
            updateSessionProfiles(s.session_id, {
              requester: requesterProfile,
              helper: helperProfile
            });
          }
        })
      );
    } catch (err) {
      console.error('Failed to load sessions or profiles:', err);
    }
  };

  const updateSessionStatusLocally = (id: string, status: Session['status']) => {
    setSessions(prev =>
      prev.map(session =>
        session.session_id === id ? { ...session, status } : session
      )
    );
  };

  const updateSessionAddress = (id: string, address: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.session_id === id ? { ...session, address } : session
      )
    );
  };

  const updateSessionProfiles = (id: string, profiles: { requester?: Profile; helper?: Profile }) => {
    setSessions(prev =>
      prev.map(session =>
        session.session_id === id
          ? {
              ...session,
              requester_profile: profiles.requester || session.requester_profile,
              helper_profile: profiles.helper || session.helper_profile,
            }
          : session
      )
    );
  };

  return (
    <SessionContext.Provider value={{ sessions, setSessions, updateSessionStatusLocally, updateSessionAddress, updateSessionProfiles, fetchSessions }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};
