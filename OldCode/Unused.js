/* Two separate functions for each which were later combined in totalVotes();
function totalMissedVotes(statistics){
    var sumMissed = {"R": 0, "D": 0, "I": 0};
    for (var i = 0; i < statistics.length; i++){
        if (statistics[i].party === "R"){
            sumMissed.R += parseFloat(statistics[i].missed_pct);
        } 
        else if (statistics[i].party === "D"){
            sumMissed.D += parseFloat(statistics[i].missed_pct);
        } 
        else {
            sumMissed.I += parseFloat(statistics[i].missed_pct);
        }
    }
    return sumMissed;
}

function totalVotesWith(statistics){
    var votesWith = {"R": 0, "D": 0, "I": 0};
    for (var i = 0; i < statistics.length; i++){
        if (statistics[i].party === "R"){
            votesWith.R += parseFloat(statistics[i].with_party_pct);
        } 
        else if (statistics[i].party === "D"){
            votesWith.D += parseFloat(statistics[i].with_party_pct);
        } 
        else {
            votesWith.I += parseFloat(statistics[i].with_party_pct);
        }
    }
    return sumMissed;
}
*/