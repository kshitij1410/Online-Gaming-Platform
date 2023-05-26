import bcrypt from "bcryptjs";
import app from '../index'
import request from 'supertest'
import { db } from "../DB/createTable";
import * as registerController from '../controller/auth.js'
import * as querySel from "../utils/runQuer";

import { register } from "../controller/auth.js";
jest.mock("../DB/createTable")

afterEach(() => {
    jest.clearAllMocks();
});

describe('register function', () => {

    let req;
    req = () => {
        return {

            name: "test41",
            email: "test105@gmail.com",
            password: "123456"
        }
    }


    it('should create a new user', async () => {


        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);
        runquery1.mockResolvedValueOnce("User has been created.");

        const genSaltSyncMock = jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
        const hashSyncMock = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedpassword');
        const result = await request(app).post("/api/register").send(mockReq);

        expect(result.text).toBe("User has been created.");
        expect(runquery1).toHaveBeenCalledTimes(2);
        expect(result.status).toBe(200);
        expect(genSaltSyncMock).toHaveBeenCalledWith(10);
        expect(hashSyncMock).toHaveBeenCalledWith('123456', 'salt');

    });

});

describe('login function', () => {

    let req;
    req = () => {
        return {

            email: "test105@gmail.com",
            password: "123456"
        }
    }
    let userInfo = {
        name: "test105",
        email: "test105@gmail.com",
        password: "1234567",
        coin: 500,
        user_id: "1234yy7y76"
    }

    it('login user not found ', async () => {

        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);

        const result = await request(app).post("/api/login").send(mockReq);

        expect(result.text).toBe("User not found!");
        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(404);

    });

    it('login user with wrong password ', async () => {

        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([userInfo]);


        const compareSyncMock = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
        const result = await request(app).post("/api/login").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(400);
        expect(result.text).toBe("Invalid Credentails!");

    });

    it('SUCCESSFULLY LOGIN USER ', async () => {
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([userInfo]);


        const compareSyncMock = jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
        const result = await request(app).post("/api/login").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(200);

    });

});



describe('updateCoin function', () => {

    let req;
    req = () => {
        return {

            name: "test41",
            email: "test105@gmail.com",
            password: "123456",
            coin: -100,
            user_id: "234e5r6thi"
        }
    }

    let userInfo = {
        name: "test105",
        email: "test105@gmail.com",
        password: "1234567",
        coin: 500,
        user_id: "1234yy7y76"
    }

    it('should user is not found', async () => {
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);
        const result = await request(app).patch("/api/updateCoin").send(mockReq);

        expect(result.text).toBe("User not found!");
        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(404);

    });

    it("SUCCESFULLY DEDUCED COIN ", async () => {

        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([userInfo]);
        runquery1.mockResolvedValueOnce([]);
        const result = await request(app).patch("/api/updateCoin").send(mockReq);

        expect(result.text).toBe("Coins deduced successfully");
        expect(runquery1).toHaveBeenCalledTimes(2);
        expect(result.status).toBe(200);

    });

    it("user don't have enough coin ", async () => {
        userInfo = {
            name: "test105",
            email: "test105@gmail.com",
            password: "1234567",
            coin: 50,
            user_id: "1234yy7y76"
        }
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([userInfo]);
        const result = await request(app).patch("/api/updateCoin").send(mockReq);

        expect(result.text).toBe("User does not have enough coins");
        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(400);

    });


});


describe('getTournamentScore function', () => {

    const data = [
        {
            name: "test1",
            score: 5
        },
        {
            name: "test2",
            score: 3
        }
    ]

    it('GETTING TOURNAMENT SCORE', async () => {
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([data]);
        const result = await request(app).get("/api/getTournamentScore")


        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(200);

    });

})


describe('getCoin function', () => {
    let req;
    req = () => {
        return {
            email: "test105@gmail.com"
        }
    }

    const data =
    {
        coin: 230
    }


    it('GETTING Coins ', async () => {
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([data]);
        const result = await request(app).post("/api/getCoin").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(200);
        expect(result.text).toBe("230");

    });

})


describe('ADDING SCORE function', () => {

    it('ADDING RANDOM SCORE ', async () => {
        let req = () => {
            return {
                game_id: "3456t7y",
                role: "randomGameEvent",
                player1_score: "3",
                player2_score: "7",
                player1_id: "567ui",
                player2_id: "54678"
            }
        }
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);
        runquery1.mockResolvedValueOnce([]);

        const result = await request(app).post("/api/addScore").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(2);
        expect(result.text).toBe("score added!!!");

    });

    it('ADDING Tournament SCORE ', async () => {
        let req = () => {
            return {
                game_id: "34560t7y",
                role: "tournamentGameEvent",
                player1_score: "3",
                player2_score: "7",
                player1_id: "5679ui",
                player2_id: "546078"
            }
        }
        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);
        runquery1.mockResolvedValueOnce([]);
        runquery1.mockResolvedValueOnce([]);
        const result = await request(app).post("/api/addScore").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(3);
        expect(result.text).toBe("Tournamnet Score is added sucessfully...");

    });



})




describe('getScore function', () => {

    let req;
    req = () => {
        return {
            game_id: "3456t7y"
        }
    }


    it('Game id is not given', async () => {

        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([]);
        const result = await request(app).post("/api/getScore").send({});

        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(400);
        expect(result.text).toBe("game id is not found");

    });

    it('GETTING SCORE', async () => {

        const mockReq = req();
        const mockData = {
            game_id: "3456t7y",
            role: "randomGameEvent",
            player1_score: "3",
            player2_score: "7",
            player1_id: "567ui",
            player2_id: "54678"
        }


        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([mockData]);
        runquery1.mockResolvedValueOnce(["abc@gmail.com"]);
        const result = await request(app).post("/api/getScore").send(mockReq);
        
        expect(result.status).toBe(200);
        expect(runquery1).toHaveBeenCalledTimes(2);

    });

})



describe('Last 5 game Summary function', () => {

    let req;
    req = () => {
        return {
            role: "random",
            state: 'win'
        }
    }

    const mockData = [
        {
            name: "abc",
            email: "abc@gmail.com",
            score: 3
        },
        {
            name: "test",
            email: "test@gmail.com",
            score: 3
        },
        {
            name: "test2",
            email: "test2@gmail.com",
            score: 3
        },
        {
            name: "test3",
            email: "test3@gmail.com",
            score: 3
        },
        {
            name: "test4",
            email: "test4@gmail.com",
            score: 3
        }
    ]

    it('GAMES SUMMARY', async () => {

        const mockReq = req();
        const runquery1 = jest.spyOn(querySel, 'runQuery');
        runquery1.mockResolvedValueOnce([mockData]);
        const result = await request(app).post("/api/getSummary").send(mockReq);

        expect(runquery1).toHaveBeenCalledTimes(1);
        expect(result.status).toBe(200);

    });

})

