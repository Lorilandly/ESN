import UserModel from '../models/user.js';
import MessageModel from '../models/message.js';

// use a factory
function searchContextFactory(context, criteria) {
    switch (context) {
        case 'citizen':
            if (criteria === 'username') {
                return new CitizenNameSearchContext();
            } else if (criteria === 'status') {
                return new CitizenStatusSearchContext();
            }
            break;
        case 'public':
            return new PublicWallSearchContext();
        case 'private':
            return new PrivateChatSearchContext();
        case 'announcement':
            return new AnnouncementSearchContext();
    }
    throw new Error(
        `Search context and criteria doesn't match existing combinations: ${context} ${criteria}`,
    );
}

class SearchContext {
    async search(input) {
        return Promise.resolve('Not Implemented');
    }
}

class CitizenNameSearchContext extends SearchContext {
    async search(input) {
        return UserModel.searchByName(input).then((response) => ({
            users: response,
        }));
    }
}

class CitizenStatusSearchContext extends SearchContext {
    async search(input) {
        return UserModel.searchByStatus(input).then((response) => ({
            users: response,
        }));
    }
}

class PublicWallSearchContext extends SearchContext {
    async search(input) {
        return MessageModel.searchPublic(input).then((response) => ({
            messages: response,
        }));
    }
}

class PrivateChatSearchContext extends SearchContext {
    async search(input, userId0, userId1) {
        return MessageModel.searchPrivate(input, userId0, userId1).then(
            (response) => ({
                messages: response,
            }),
        );
    }
}

class AnnouncementSearchContext extends SearchContext {}

export default searchContextFactory;
