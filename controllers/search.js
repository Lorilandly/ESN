import UserModel from '../models/user.js';
import MessageModel from '../models/message.js';
import StatusModel from '../models/status.js';

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
    static bannedWordsList = [
        'a',
        'able',
        'about',
        'across',
        'after',
        'all',
        'almost',
        'also',
        'am',
        'among',
        'an',
        'and',
        'any',
        'are',
        'as',
        'at',
        'be',
        'because',
        'been',
        'but',
        'by',
        'can',
        'cannot',
        'could',
        'dear',
        'did',
        'do',
        'does',
        'either',
        'else',
        'ever',
        'every',
        'for',
        'from',
        'get',
        'got',
        'had',
        'has',
        'have',
        'he',
        'her',
        'hers',
        'him',
        'his',
        'how',
        'however',
        'i',
        'if',
        'in',
        'into',
        'is',
        'it',
        'its',
        'just',
        'least',
        'let',
        'like',
        'likely',
        'may',
        'me',
        'might',
        'most',
        'must',
        'my',
        'neither',
        'no',
        'nor',
        'not',
        'of',
        'off',
        'often',
        'on',
        'only',
        'or',
        'other',
        'our',
        'own',
        'rather',
        'said',
        'say',
        'says',
        'she',
        'should',
        'since',
        'so',
        'some',
        'than',
        'that',
        'the',
        'their',
        'them',
        'then',
        'there',
        'these',
        'they',
        'this',
        'tis',
        'to',
        'too',
        'twas',
        'us',
        'wants',
        'was',
        'we',
        'were',
        'what',
        'when',
        'where',
        'which',
        'while',
        'who',
        'whom',
        'why',
        'will',
        'with',
        'would',
        'yet',
        'you',
        'your',
    ];

    stopRule(input) {
        const regex = new RegExp(
            `\\b(${SearchContext.bannedWordsList.join('|')})\\b`,
            'gi',
        );
        return input.replace(regex, '').replace(/\s+/g, ' ').trim();
    }

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
        input = this.stopRule(input);
        if (!input) {
            return new Error('No search input provided!');
        }
        return MessageModel.searchPublic(input).then((response) => ({
            messages: response,
        }));
    }
}

class PrivateChatSearchContext extends SearchContext {
    async search(input, userId0, userId1) {
        input = this.stopRule(input);
        if (!input) {
            return new Error('No search input provided!');
        }
        if (input.toLowerCase() === 'status') {
            return StatusModel.getLatestUserStatusChange(userId0).then(
                (response) => ({
                    type: 'status',
                    messages: response,
                }),
            );
        } else {
            return MessageModel.searchPrivate(input, userId0, userId1).then(
                (response) => ({
                    type: 'message',
                    messages: response,
                }),
            );
        }
    }
}

class AnnouncementSearchContext extends SearchContext {}

export default searchContextFactory;
