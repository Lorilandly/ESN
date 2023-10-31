**DP Specification and Rationale: Factory Pattern**

For iteration 3, we are choosing the Factory desgin to implement the search information use case. The rationale for using it include:

1. **Various Search Context:** Since the use case includes a variety of search contexts such as list of citizens, public announcements, public messages and private messages, each requires a specfic search context which makes it suitable for having a factory design pattern to provide concrete factory methods based on the user's search criteria.

2. **Encapsulates Search Context Creation** By using factory design pattern, the implementation different search context creation is hidden from clients.

3. **Scalabililty** New search contexts can be easily integrated to the factory of different search contexts.