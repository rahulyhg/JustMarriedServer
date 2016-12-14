import express from "express";
import path from 'path'
import logger from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import httpStatus from "http-status";
import expressWinston from "express-winston";
import expressValidation from "express-validation";
import helmet from "helmet";
import winstonInstance from "./config/winston";
import APIError from "./helpers/APIError";
import swaggerizeExpress from 'swaggerize-express';
import passport from 'passport'

const app = express();
const env = process.env.env;


initializeLogging();
configureOthers();
setupAuth();
mountApi();
swaggerize();
configureErrorHandling();
configureNotFoundBehaviour();

function setupAuth() {
    app.use(passport.initialize());
}

function swaggerize() {
    app.use(swaggerizeExpress({
        api: require('./api.json'), // can change it to yaml and it would work, get rid of that plugin...
        docspath: '/api-docs',
        handlers: './handlers',
        security: './security'
    }));
}

function configureOthers() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());
    app.use(helmet());
    app.use(cors());
}

function configureNotFoundBehaviour() {
    app.use((req, res, next) => {
        const err = new APIError('API not found', httpStatus.NOT_FOUND);
        return next(err);
    });
}

function configureErrorHandling() {
    app.use((err, req, res, next) => {
        if (err instanceof expressValidation.ValidationError) {
            const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
            const error = new APIError(unifiedErrorMessage, err.status, true);
            return next(error);
        } else if (!(err instanceof APIError)) {
            const apiError = new APIError(err.message, err.status, err.isPublic);
            return next(apiError);
        }
        return next(err);
    });
    app.use((err, req, res) => {
        res.status(err.status).json({
            message: err.isPublic ? err.message : httpStatus[err.status],
            stack: process.env.env === 'development' ? err.stack : {}
        });
    });
}

function initializeLogging() {
    if (env === 'development') {
        app.use(logger('dev'));
        expressWinston.requestWhitelist.push('body');
        expressWinston.responseWhitelist.push('body');
        app.use(expressWinston.logger({
            winstonInstance,
            meta: true,
            msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
            colorStatus: true
        }));
    }

    if (env !== 'test') {
        app.use(expressWinston.errorLogger({
            winstonInstance
        }));
    }
}

function mountApi() {
    // app.use('/api', routes);
}

export default app;
