const axios = require("axios");
require("dotenv").config();

const CLIST_API_KEY = process.env.CLIST_API_KEY;

// Fetches Codeforces contests

const fetchCodeforcesContests = async () => {
    try {
        const response = await axios.get("https://codeforces.com/api/contest.list");
        if (!response.data?.result) return [];

        return response.data.result.map((contest) => {
            const startTimeUTC = new Date(contest.startTimeSeconds * 1000);
            const startTimeIST = startTimeUTC.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });

            return {
                name: contest.name,
                platform: "Codeforces",
                startTime: startTimeIST, // Store the IST formatted time
                duration: contest.durationSeconds,
                url: `https://codeforces.com/contest/${contest.id}`,
                status: contest.phase === "BEFORE" ? "Upcoming" : "Past",
            };
        });
    } catch (error) {
        console.error("Error fetching Codeforces contests:", error.message);
        return [];
    }
};

// Fetches CodeChef contests
const fetchCodeChefContests = async () => {
    try {
        const response = await axios.get("https://www.codechef.com/api/list/contests/all");
        if (!response.data) return [];

        return [...response.data.future_contests, ...response.data.past_contests].map((contest) => {
            const startDateUTC = new Date(contest.contest_start_date);
            const endDateUTC = new Date(contest.contest_end_date);

            const startTimeIST = startDateUTC.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });

            return {
                name: contest.contest_name,
                platform: "CodeChef",
                startTime: startTimeIST, // Store IST String
                duration: (endDateUTC - startDateUTC) / 1000,
                url: `https://www.codechef.com/${contest.contest_code}`,
                status: startDateUTC > new Date() ? "Upcoming" : "Past",
            };
        });
    } catch (error) {
        console.error("Error fetching CodeChef contests:", error.message);
        return [];
    }
};

// Generic function to fetch contests from CLIST API for a given host
const fetchContestsFromClist = async (host, pastLimit, upcomingLimit) => {
    try {
        const urls = [
            { url: `https://clist.by:443/api/v4/contest/?limit=${pastLimit}&upcoming=false&fformat_time=true&host=${encodeURIComponent(host)}&order_by=-start`, status: "Past" },
            { url: `https://clist.by:443/api/v4/contest/?limit=${upcomingLimit}&upcoming=true&format_time=truehost=${encodeURIComponent(host)}&order_by=start`, status: "Upcoming" },
        ];

        const results = await Promise.allSettled(urls.map(({ url }) => axios.get(url, { headers: { Authorization: `ApiKey ${CLIST_API_KEY}` } })));

        return results
            .filter((result) => result.status === "fulfilled")
            .flatMap((result, index) =>
                result.value.data.objects.map((contest) => ({
                    name: contest.event,
                    platform: host.replace(".com", "").replace(".org", "").replace("naukri.com/code360", "Naukri Code360").toUpperCase(), // Convert host to readable platform name
                    startTime: contest.start,
                    duration: contest.duration,
                    url: contest.href,
                    status: urls[index].status,
                }))
            );
    } catch (error) {
        console.error(`Error fetching ${host.toUpperCase()} contests:`, error.message);
        return [];
    }
};

// Fetches LeetCode contests from CLIST API
const fetchLeetCodeContests = () => fetchContestsFromClist("leetcode.com", 10000, 10);

// Fetches SPOJ contests from CLIST API
const fetchSpojContests = () => fetchContestsFromClist("spoj.com", 1000, 10);

// Fetches GeeksforGeeks contests from CLIST API
const fetchGeeksforGeeksContests = () => fetchContestsFromClist("geeksforgeeks.org", 1000, 10);

// Fetches Naukri Code360 (Coding Ninjas) contests from CLIST API
const fetchNaukriCode360Contests = () => fetchContestsFromClist("naukri.com/code360", 1000, 10);

// Fetches all contests from multiple sources
const fetchAllContests = async () => {
    try {
        const results = await Promise.allSettled([
            fetchLeetCodeContests(),
            fetchSpojContests(),
            fetchGeeksforGeeksContests(),
            fetchNaukriCode360Contests(),
            fetchCodeforcesContests(),
            fetchCodeChefContests(),
        ]);

        return results
            .filter((result) => result.status === "fulfilled")
            .flatMap((result) => result.value);
    } catch (error) {
        console.error("Error fetching all contests:", error.message);
        return [];
    }
};

module.exports = { fetchAllContests };
