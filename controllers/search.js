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
        return { result: 'good' };
    }
}

class CitizenNameSearchContext extends SearchContext {}
class CitizenStatusSearchContext extends SearchContext {}
class PublicWallSearchContext extends SearchContext {}
class PrivateChatSearchContext extends SearchContext {}
class AnnouncementSearchContext extends SearchContext {}

export default searchContextFactory;
