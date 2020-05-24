const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) =>  user.id === id);

    if (index != -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
};


// tests

// addUser({
//     id: 22,
//     username: 'Zach  ',
//     room: '  123'
// });

// console.log(users);

// const res = addUser({
//     id: 32,
//     username: 'Zach',
//     room: '123'
// });

// console.log(res);

// const removedUser = removeUser(22);

// console.log(removedUser, users);

// console.log(getUser(22));

// console.log(getUsersInRoom('123'));