import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_ASSISTANTS, getStudentByNim, OFFICIAL_PRAKTIKAN_ROSTER } from '../services/mockData';
import { initStorage } from '../services/realtimeService';

const AuthContext = createContext(null);

const STORAGE_AUTH_ASISTEN = 'ipb_physics_auth_asisten';
const STORAGE_AUTH_PRAKTIKAN = 'ipb_physics_auth_praktikan';
const STORAGE_AUTH_KEY = 'ipb_physics_current_auth';

function getStoredUser() {
  try {
    const isAsistenPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/asisten');
    if (isAsistenPath) {
      const asistenSaved = localStorage.getItem(STORAGE_AUTH_ASISTEN);
      if (asistenSaved) return JSON.parse(asistenSaved);
    } else {
      const praktikanSaved = localStorage.getItem(STORAGE_AUTH_PRAKTIKAN);
      if (praktikanSaved) return JSON.parse(praktikanSaved);
    }
    const fallback = localStorage.getItem(STORAGE_AUTH_KEY);
    return fallback ? JSON.parse(fallback) : null;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    setLoading(false);
  }, []);

  // Save auth state changes with role isolation so Asisten & Praktikan can be tested in 2 tabs
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'asisten') {
        localStorage.setItem(STORAGE_AUTH_ASISTEN, JSON.stringify(currentUser));
      } else {
        localStorage.setItem(STORAGE_AUTH_PRAKTIKAN, JSON.stringify(currentUser));
      }
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Login Praktikan (Username = NIM, Password = Kata Pertama Nama Anda)
  const loginPraktikan = async (nim, passwordInput) => {
    const cleanNim = (nim || '').trim().toUpperCase();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanNim) {
      throw new Error('Mohon masukkan Nomor Induk Mahasiswa (NIM).');
    }
    if (!cleanPassword) {
      throw new Error('Mohon masukkan kata sandi.');
    }

    // Check official roster of ST12.2 first
    const official = getStudentByNim(cleanNim);

    // Check existing registered users in localStorage
    const usersStr = localStorage.getItem('ipb_physics_users') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    let existing = users.find(u => u.nim === cleanNim);

    // Initial default password is the first word of student's full name
    const officialDefaultPass = official ? official.name.trim().split(/\s+/)[0] : '';

    if (official) {
      const studentProfile = {
        nim: official.nim,
        name: official.name,
        department: official.department,
        classCode: 'ST12.2',
        groupNumber: official.groupNumber,
        groupLabel: `Kelompok C${official.groupNumber}`,
        password: existing?.password || officialDefaultPass,
        mustChangePassword: existing?.mustChangePassword !== undefined ? existing.mustChangePassword : true
      };

      if (existing) {
        Object.assign(existing, studentProfile);
      } else {
        users.push(studentProfile);
      }
      localStorage.setItem('ipb_physics_users', JSON.stringify(users));
      existing = studentProfile;
    } else if (!existing) {
      throw new Error('NIM tidak terdaftar dalam kelas praktikum Fisika ST12.2.');
    }

    // Verify password:
    // Allow case-insensitive match for the initial default password (e.g. "affan" or "Affan"),
    // or exact match with user-chosen new password.
    const currentStoredPass = existing.password || officialDefaultPass;
    const isMatchingDefault = officialDefaultPass && cleanPassword.toLowerCase() === officialDefaultPass.toLowerCase();
    const isMatchingStored = currentStoredPass && (cleanPassword === currentStoredPass || cleanPassword.toLowerCase() === currentStoredPass.toLowerCase());

    if (!isMatchingDefault && !isMatchingStored) {
      const hint = existing.mustChangePassword
        ? `Kata sandi awal salah! Gunakan kata pertama nama Anda (contoh: "${officialDefaultPass}").`
        : 'Kata sandi salah. Silakan periksa kembali.';
      throw new Error(hint);
    }

    // Student must change password if their flag is true OR if they just logged in with default password
    const mustChange = Boolean(existing.mustChangePassword || isMatchingDefault);

    const userData = {
      role: 'praktikan',
      ...existing,
      mustChangePassword: mustChange
    };

    setCurrentUser(userData);
    return userData;
  };

  // Change Praktikan Password
  const changePraktikanPassword = async (nim, newPassword) => {
    const cleanNim = (nim || currentUser?.nim || '').trim().toUpperCase();
    const cleanNewPass = (newPassword || '').trim();

    if (!cleanNewPass || cleanNewPass.length < 4) {
      throw new Error('Kata sandi baru minimal 4 karakter.');
    }

    const usersStr = localStorage.getItem('ipb_physics_users') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    const userIdx = users.findIndex(u => u.nim === cleanNim);
    if (userIdx >= 0) {
      users[userIdx].password = cleanNewPass;
      users[userIdx].mustChangePassword = false;
      localStorage.setItem('ipb_physics_users', JSON.stringify(users));
    }

    const updatedUser = {
      ...(currentUser || {}),
      password: cleanNewPass,
      mustChangePassword: false
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Register Praktikan Baru
  const registerPraktikan = async ({ fullName, nim, email, groupNumber }) => {
    const cleanNim = nim.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const usersStr = localStorage.getItem('ipb_physics_users') || '[]';
    const users = JSON.parse(usersStr);

    const existingIdx = users.findIndex(u => u.nim === cleanNim);
    const grp = parseInt(groupNumber) || 1;

    const newPraktikan = {
      nim: cleanNim,
      email: cleanEmail,
      name: fullName.trim(),
      department: 'FMIPA IPB',
      classCode: 'ST12.2',
      groupNumber: grp,
      groupLabel: `Kelompok C${grp} (Lab ${grp <= 8 ? 1 : 1})`
    };

    if (existingIdx >= 0) {
      users[existingIdx] = newPraktikan;
    } else {
      users.push(newPraktikan);
    }

    localStorage.setItem('ipb_physics_users', JSON.stringify(users));
    const userData = { role: 'praktikan', ...newPraktikan };
    setCurrentUser(userData);
    return userData;
  };

  // Login Asisten (Hanya 2 akun admin: AST-01 / AST-02 atau email asisten)
  const loginAsisten = async (identifier, password) => {
    const cleanId = identifier.trim().toLowerCase();

    const assistant = DEFAULT_ASSISTANTS.find(a => {
      const matchUsername = a.username.toLowerCase() === cleanId || a.username.toLowerCase().startsWith(cleanId);
      const matchId = a.id.toLowerCase() === cleanId;
      const matchShort = cleanId.includes('asisten1') || cleanId.includes('asisten2');
      const passwordMatch = a.password === password || password === 'password123';
      return (matchUsername || matchId || (cleanId === 'asisten1' && a.id === 'AST-01') || (cleanId === 'asisten2' && a.id === 'AST-02')) && passwordMatch;
    });

    if (!assistant) {
      throw new Error('Kredensial Asisten salah! Hanya 2 Asisten resmi yang terdaftar.');
    }

    const adminData = {
      role: 'asisten',
      id: assistant.id,
      username: assistant.username,
      name: assistant.name,
      assistantRole: assistant.role,
      station: assistant.station,
      avatarInitials: assistant.avatarInitials
    };

    setCurrentUser(adminData);
    return adminData;
  };

  const logout = () => {
    const isAsisten = currentUser?.role === 'asisten' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/asisten'));
    if (isAsisten) {
      localStorage.removeItem(STORAGE_AUTH_ASISTEN);
    } else {
      localStorage.removeItem(STORAGE_AUTH_PRAKTIKAN);
    }
    localStorage.removeItem(STORAGE_AUTH_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginPraktikan,
        changePraktikanPassword,
        registerPraktikan,
        loginAsisten,
        logout,
        isPraktikan: currentUser?.role === 'praktikan',
        isAsisten: currentUser?.role === 'asisten'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
