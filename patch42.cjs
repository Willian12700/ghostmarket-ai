const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const oldAvatarTable = `<div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                              {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || '?'}
                            </div>`;

const newAvatarTable = `{u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}`;

admin = admin.replace(oldAvatarTable, newAvatarTable);

const oldAvatarDrawer = `<div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                    {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || '?'}
                  </div>`;

const newAvatarDrawer = `{selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                      {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}`;

admin = admin.replace(oldAvatarDrawer, newAvatarDrawer);

fs.writeFileSync('src/pages/AdminPanel.tsx', admin);
