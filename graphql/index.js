const { gql, ApolloServer,  } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
module.exports.pubsub = pubsub;
const Blog = require('./blog');
const Error = require('./error');
const Faq = require('./faq');
const File = require('./file');
const NakladnayaNaPustuyTaru  = require('./nakladnayaNaPustuyTaru');
const NakladnayaNaVecherniyVozvrat  = require('./nakladnayaNaVecherniyVozvrat');
const SpecialPrice  = require('./specialPrice');
const NakladnayaSklad1 = require('./nakladnayaSklad1');
const NakladnayaSklad2 = require('./nakladnayaSklad2');
const Organizator = require('./organizator');
const OtchetOrganizatora = require('./otchetOrganizatora');
const OtchetRealizatora = require('./otchetRealizatora');
const Passport = require('./passport');
const Plan = require('./plan');
const Inspector = require('./inspector');
const ActInspector = require('./actInspector');
const ChecklistInspector = require('./checklistInspector');
const Point = require('./point');
const GeoPoint = require('./geoPoint');
const Tara = require('./tara');
const Price = require('./price');
const Realizator = require('./realizator');
const Region = require('./region');
const Statistic = require('./statistic');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');
const ModelsError = require('../models/error');

const typeDefs = gql`
    scalar Date
    type User {
        login: String
        role: String
        status: String
    }
    ${Error.type}
    ${NakladnayaNaPustuyTaru.type}
    ${NakladnayaNaVecherniyVozvrat.type}
    ${SpecialPrice.type}
    ${NakladnayaSklad1.type}
    ${File.type}
    ${NakladnayaSklad2.type}
    ${Organizator.type}
    ${OtchetOrganizatora.type}
    ${GeoPoint.type}
    ${Plan.type}
    ${Inspector.type}
    ${ActInspector.type}
    ${ChecklistInspector.type}
    ${OtchetRealizatora.type}
    ${Faq.type}
    ${Point.type}
    ${Price.type}
    ${Tara.type}
    ${Realizator.type}
    ${Region.type}
    ${Blog.type}
    ${Passport.type}
    ${Statistic.type}
    type Mutation {
        ${NakladnayaNaPustuyTaru.mutation}
        ${NakladnayaSklad1.mutation}
        ${SpecialPrice.mutation}
        ${NakladnayaSklad2.mutation}
        ${Organizator.mutation}
        ${Error.mutation}
        ${OtchetOrganizatora.mutation}
        ${GeoPoint.mutation}
        ${OtchetRealizatora.mutation}
        ${Plan.mutation}
        ${Inspector.mutation}
        ${ChecklistInspector.mutation}
        ${ActInspector.mutation}
        ${File.mutation}
        ${Realizator.mutation}
        ${Faq.mutation}
        ${Blog.mutation}
        ${Passport.mutation}
    }
    type Query {
        ${Error.query}
        ${NakladnayaNaPustuyTaru.query}
        ${NakladnayaNaVecherniyVozvrat.query}
        ${SpecialPrice.query}
        ${NakladnayaSklad1.query}
        ${File.query}
        ${NakladnayaSklad2.query}
        ${Organizator.query}
        ${OtchetOrganizatora.query}
        ${GeoPoint.query}
        ${Plan.query}
        ${ActInspector.query}
        ${ChecklistInspector.query}
        ${Inspector.query}
        ${OtchetRealizatora.query}
        ${Faq.query}
        ${Point.query}
        ${Price.query}
        ${Tara.query}
        ${Realizator.query}
        ${Region.query}
        ${Blog.query}
        ${Passport.query}
        ${Statistic.query}
    }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value).getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        },
    }),
    Query: {
        ...Error.resolvers,
        ...NakladnayaNaPustuyTaru.resolvers,
        ...NakladnayaNaVecherniyVozvrat.resolvers,
        ...NakladnayaSklad1.resolvers,
        ...SpecialPrice.resolvers,
        ...File.resolvers,
        ...NakladnayaSklad2.resolvers,
        ...Organizator.resolvers,
        ...OtchetOrganizatora.resolvers,
        ...GeoPoint.resolvers,
        ...Plan.resolvers,
        ...Inspector.resolvers,
        ...ActInspector.resolvers,
        ...ChecklistInspector.resolvers,
        ...OtchetRealizatora.resolvers,
        ...Faq.resolvers,
        ...Point.resolvers,
        ...Price.resolvers,
        ...Tara.resolvers,
        ...Realizator.resolvers,
        ...Region.resolvers,
        ...Blog.resolvers,
        ...Passport.resolvers,
        ...Statistic.resolvers,
    },
    Mutation: {
        ...Error.resolversMutation,
        ...NakladnayaNaPustuyTaru.resolversMutation,
        ...NakladnayaSklad1.resolversMutation,
        ...SpecialPrice.resolversMutation,
        ...File.resolversMutation,
        ...NakladnayaSklad2.resolversMutation,
        ...Organizator.resolversMutation,
        ...OtchetOrganizatora.resolversMutation,
        ...GeoPoint.resolversMutation,
        ...Plan.resolversMutation,
        ...Inspector.resolversMutation,
        ...ActInspector.resolversMutation,
        ...ChecklistInspector.resolversMutation,
        ...OtchetRealizatora.resolversMutation,
        ...Faq.resolversMutation,
        ...Realizator.resolversMutation,
        ...Blog.resolversMutation,
        ...Passport.resolversMutation,
    }
};

const run = (app)=>{
    const server = new ApolloServer({
        playground: false,
        typeDefs,
        resolvers,
        subscriptions: {
            keepAlive: 1000,
            onConnect: async (connectionParams) => {
                if (connectionParams&&connectionParams.authorization) {
                    let user = await verifydeuserGQL({headers: {authorization: connectionParams.authorization}}, {})
                    return {
                        user: user,
                    }
                }
                else return {
                    user: {}
                }
                //throw new Error('Missing auth token!');
            },
            onDisconnect: (webSocket, context) => {
                // ...
            },
        },
        context: async (ctx) => {
            //console.log(ctx)
            if (ctx.connection) {
                return ctx.connection.context;
            }
            else if(ctx&&ctx.req) {
                let user = await verifydeuserGQL(ctx.req, ctx.res)
                return {req: ctx.req, res: ctx.res, user: user};
            }
        },
        formatError: async (err) => {
            console.error(err)
            let object = new ModelsError({
                err: `gql: ${err.message}`,
                path: JSON.stringify(err.path)
            });
            if(!object.path)
                object.path = JSON.stringify(err.extensions.exception.stacktrace)
            await ModelsError.create(object)
            return err;
        }
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
