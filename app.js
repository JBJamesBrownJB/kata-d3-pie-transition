function renderViz() {
    d3.json("tweets.json").then(data => {
        var colorRamp = d3.scaleOrdinal().domain([0, 1, 2, 3, 4, 5]).range(d3.schemeTableau10)
        data = d3.nest()
            .key(d => d.user)
            .entries(data.tweets)

        data.forEach(d => {
            d.numTweets = d.values.length
            d.numFavorites = d3.sum(d.values, d => d.favorites.length)
            d.numRetweets = d3.sum(d.values, d => d.retweets.length)
        });

        d3.select("svg").append("g").attr("id", "chart").attr("transform", "translate(250,250)")

        var pie = d3.pie()
        pie.value(d => d.numTweets).sort(null)

        var tweetsPie = pie(data)

        pie.value(d => d.numRetweets)
        var reTweetsPie = pie(data)

        data.forEach((d, i) => {
            d.tweetsSlice = tweetsPie[i]
            d.retweetsSlice = reTweetsPie[i]
        })

        console.log(data)

        var arcGen = d3.arc().innerRadius(20).outerRadius(100)
        d3.select("#chart").selectAll(".slice")
            .data(data, d => d.key)
            .enter()
            .append("path")
            .attr("class", "slice")
            .attr("id", (d, i) => `slice-${i}`)
            .attr("d", d => arcGen(d.tweetsSlice))
            .attr("fill", (d, i) => colorRamp(i))

        setTimeout(() => {
            transitionRetweets()
        }, 1000)


        function transitionRetweets() {
            d3.selectAll(".slice")
                .transition()
                .duration(1000)
                .attrTween("d", arcTweenRetweets)
            setTimeout(() => {
                transitionTweets()
            }, 1000)
        }

        function transitionTweets() {
            d3.selectAll(".slice")
                .transition()
                .duration(1000)
                .attrTween("d", arcTweenTweets)
            setTimeout(() => {
                transitionRetweets()
            }, 1000)
        }

        function arcTweenRetweets(d) {
            return t => {
                var interpStartAngle = d3.interpolate(d.tweetsSlice.startAngle, d.retweetsSlice.startAngle)
                var interpEndAngle = d3.interpolate(d.tweetsSlice.endAngle, d.retweetsSlice.endAngle)
                d.startAngle = interpStartAngle(t)
                d.endAngle = interpEndAngle(t)
                return arcGen(d)
            }
        }

        function arcTweenTweets(d) {
            return t => {
                var interpStartAngle = d3.interpolate(d.retweetsSlice.startAngle, d.tweetsSlice.startAngle)
                var interpEndAngle = d3.interpolate(d.retweetsSlice.endAngle, d.tweetsSlice.endAngle)
                d.startAngle = interpStartAngle(t)
                d.endAngle = interpEndAngle(t)
                return arcGen(d)
            }
        }
    })
}