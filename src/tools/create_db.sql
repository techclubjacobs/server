create database if not exists JacobsApp;
use JacobsApp;

-- -- -- --
-- Users --
-- -- -- --

create table User (
    user_id int not null auto_increment,
    first_name varchar(40) not null, 
    last_name varchar(40) not null,
    email varchar(50) not null, 
    activated bit not null,
    joined datetime not null,
    -- declarations
    primary key (user_id)
);

create table UserGroup (
    usergroup_id int not null auto_increment,
    title varchar(40) not null,
    -- optionals
    max_capacity int,
    descrip varchar(160),
    -- declarations
    primary key (usergroup_id)
);

create table UserGroupOwner (
    user_id int not null,
    usergroup_id int not null, 
    -- declarations
    primary key (user_id, usergroup_id),
    foreign key (user_id) references User(user_id),
    foreign key (usergroup_id) references UserGroup(usergroup_id)
);

create table UserGroupMembership (
    user_id int not null,
    usergroup_id int not null,
    -- declarations
    primary key (user_id, usergroup_id), 
    foreign key (user_id) references User(user_id),
    foreign key (usergroup_id) references UserGroup(usergroup_id)
);

-- -- -- -- --
-- Metadata --
-- -- -- -- --

create table Location (
    location_id int not null auto_increment,
    title varchar(30) not null, 
    -- declarations
    primary key (location_id)
);

create table EventCategory (
    evcat_id int not null auto_increment,
    title varchar(30) not null,
    -- declarations
    primary key (evcat_id)
);

-- decoration, furniture, electronics, services, books, clothes, other
create table ProductCategory (
    prodcat_id int not null auto_increment,
    title varchar(30) not null,
    -- declarations
    primary key (prodcat_id)
);

-- -- -- -- --
-- Products --
-- -- -- -- --

create table Product (
    product_id int not null auto_increment,
    evcat_id int not null,
    seller_id int not null,
    title varchar(40) not null, 
    price decimal(10,2) not null, 
    published datetime not null, 
    active bit not null,
    sold bit not null,
    quantity int not null, 
    -- declarations
    foreign key (evcat_id) references ProductCategory(prodcat_id),
    foreign key (seller_id) references User(user_id),
    primary key (product_id)
);

-- -- -- --
-- Chats --
-- -- -- --

create table Chat (
    chat_id int not null auto_increment,
    product_id int not null, 
    buyer_id int not null, 
    seller_id int not null,
    -- declarations
    foreign key (product_id) references Product(product_id),
    foreign key (buyer_id) references User(user_id),
    foreign key (seller_id) references User(user_id),
    primary key (chat_id)
);

create table Message (
    message_id int not null auto_increment,
    chat_id int not null, 
    published datetime not null,
    seen bit not null,
    content varchar(160) not null,
    -- declarations
    foreign key (chat_id) references Chat(chat_id),
    primary key (message_id)
);

-- -- -- ---
-- Events --
-- -- -- ---

create table Event (
    event_id int not null auto_increment,
    title varchar(50) not null,
    public bit not null, 
    -- optional
    max_capacity int,
    content varchar(160),
    -- foreign
    usergroup_id int not null,
    location_id int not null,
    evcat_id int not null,
    -- declarations
    primary key (event_id),
    foreign key (usergroup_id) references UserGroup(usergroup_id),
    foreign key (location_id) references Location(location_id),
    foreign key (evcat_id) references EventCategory(evcat_id)
);

create table OneTimeEvent (
    event_id int not null,
    day date not null,
    start_time time not null,
    end_time time not null,
    -- declarations
    foreign key (event_id) references Event(event_id),
    primary key (event_id)
);

create table RecurringEvent (
    recurringevent_id int not null auto_increment, 
    event_id int not null,
    occurences int not null, -- what is this
    -- declarations
    foreign key (event_id) references Event(event_id),
    primary key (recurringevent_id)
);

-- multi day events?
create table RecurringSingleEvent (
    recurringsingle_id int not null auto_increment,
    recurringevent_id int not null,
    day date not null,
    start_time time not null,
    end_time time not null,
    -- declarations
    foreign key (recurringevent_id) references RecurringEvent(recurringevent_id),
    primary key (recurringsingle_id)
);

-- -- -- -- -- -
-- Organizers --
-- -- -- -- -- -

create table Organizer (
    user_id int not null,
    event_id int not null,
    -- declarations
    foreign key (user_id) references User(user_id),
    foreign key (event_id) references Event(event_id),
    primary key (event_id, user_id)
);

-- -- -- -- -- -- 
-- Attendances --
-- -- -- -- -- -- 

create table SingularAttendance (
    user_id int not null,
    event_id int not null,
    -- declarations
    foreign key (user_id) references User(user_id),
    foreign key (event_id) references Event(event_id),
    primary key (event_id, user_id)
);

create table RecurringAttendance (
    user_id int not null,
    event_id int not null,
    -- declarations
    foreign key (user_id) references User(user_id),
    foreign key (event_id) references Event(event_id),
    primary key (event_id, user_id)
);

-- -- -- -- --
-- Requests --
-- -- -- -- --

create table Request (
    request_id int not null auto_increment,
    user_id int not null,
    message varchar(160) not null,
    decision int, -- what is this
    -- declarations
    foreign key (user_id) references User(user_id),
    primary key (request_id)
);

create table EventRequest (
    request_id int not null, 
    event_id int not null,
    -- declarations
    foreign key (request_id) references Request(request_id),
    foreign key (event_id) references Event(event_id),
    primary key (request_id)
);

create table GroupRequest (
    request_id int not null, 
    usergroup_id int not null,
    -- declarations
    foreign key (request_id) references Request(request_id),
    foreign key (usergroup_id) references UserGroup(usergroup_id),
    primary key (request_id)
);

-- -- -- -- -
-- Invites --
-- -- -- -- -

create table Invite (
    invite_id int not null auto_increment,
    user_id int not null,
    message varchar(160) not null, 
    decision varchar(160), -- what is this
    -- declarations
    foreign key (user_id) references User(user_id),
    primary key (invite_id)
);

create table EventInvite (
    invite_id int not null,
    event_id int not null,
    -- declarations
    foreign key (invite_id) references Invite(invite_id),
    foreign key (event_id) references Event(event_id),
    primary key (invite_id)
);

create table UserGroupInvite (
    invite_id int not null,
    usergroup_id int not null,
    -- declarations
    foreign key (invite_id) references Invite(invite_id),
    foreign key (usergroup_id) references UserGroup(usergroup_id),
    primary key (invite_id)
);

-- -- -- -- -- -- -
-- Notifications --
-- -- -- -- -- -- -

-- message in notification and in request
create table Notification (
    notification_id int not null auto_increment,
    user_id int not null,
    message varchar(160) not null,
    -- declarations
    foreign key (user_id) references User(user_id),
    primary key (notification_id)
);

create table RequestNotification (
    notification_id int not null,
    request_id int not null, 
    -- declarations
    foreign key (request_id) references Request(request_id),
    foreign key (notification_id) references Notification(notification_id),
    primary key (notification_id)
);

create table InviteNotification (
    notification_id int not null,
    invite_id int not null, 
    -- declarations
    foreign key (invite_id) references Invite(invite_id),
    foreign key (notification_id) references Notification(notification_id),
    primary key (notification_id)
);