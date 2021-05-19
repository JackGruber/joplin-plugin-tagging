type TagSearch = {
    type: 'tagSearch',
    query: string,
};

type TagResult = {
    type: 'tagResult',
    result: Tag[],
};

type Tag = {
    id: string,
    title: string,
}

type ResultMessage = TagResult;
type SearchMessage = TagSearch;

export { ResultMessage, SearchMessage, TagSearch, TagResult, Tag};