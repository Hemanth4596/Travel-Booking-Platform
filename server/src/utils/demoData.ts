export interface DemoUser {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone: string;
  passwordHash?: string;
  passwordPlain?: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'user1@travelbooking.com': {
    _id: '6630f9a2b7e1234567890001',
    name: 'Demo User 1',
    email: 'user1@travelbooking.com',
    role: 'USER',
    phone: '+1-555-0101',
    passwordPlain: 'User1@123',
  },
  'user2@travelbooking.com': {
    _id: '6630f9a2b7e1234567890002',
    name: 'Demo User 2',
    email: 'user2@travelbooking.com',
    role: 'USER',
    phone: '+1-555-0102',
    passwordPlain: 'User2@123',
  },
  'admin@travelbooking.com': {
    _id: '6630f9a2b7e1234567890000',
    name: 'Admin User',
    email: 'admin@travelbooking.com',
    role: 'ADMIN',
    phone: '+1-555-0100',
    passwordPlain: 'admin123',
  },
};

export const getDemoUserById = (id: string): DemoUser | undefined => {
  return Object.values(DEMO_USERS).find((u) => u._id === id);
};

export const getDemoUserByEmail = (email: string): DemoUser | undefined => {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS[normalized];
};
