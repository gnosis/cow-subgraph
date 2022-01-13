# Cow-subgraph

Implements a subgraph for the Gnosis Protocol V 2 a.k.a. Cowswap 

*So far this is a work in progress.*

It's working on mainnet, rinkeby and xdai network.

Docs about Cowswap: https://docs.cowswap.exchange/
GP v2 contracts repo: https://github.com/gnosis/gp-v2-contracts/
Mainnet deployment on hosted service: https://thegraph.com/hosted-service/subgraph/gnosis/cow
There is also a GP v1 subgraph here: https://github.com/gnosis/dex-subgraph

## To do list: 

- Deploy subgraph on Rinkeby
- Deploy subgraph on xDAI

## Setup

*Requisites:* You must have access to a console and have yarn installed. More info about [yarn](https://classic.yarnpkg.com/lang/en/docs/)


1.- Install The Graph CLI globally as suggested in The Graph [docs](https://thegraph.com/docs/en/developer/quick-start/) by running the following:

```
$ yarn global add @graphprotocol/graph-cli
```

2.- Clone this repo and install the dependencies by executing:

```
$ yarn
```

3.- Go to The Graph [hosted service](https://thegraph.com/hosted-service/dashboard) and log in using your github credentials. 

4.- Copy your access token and run the following

```
$ graph auth --product hosted-service <YourAccessToken>
```

5.- Using your browser create a new subgraph in the dashboard by clicking "Add Subgraph" button and complete the form. Notice your subgraph will be named as the following: "YourGithubAccount/SubgraphName"

6.- Edit the package.json file using your favorite editor. Replace <YourGithubUser/YourSubgraph> with the value obtained in the previous step. (Remove the "<" and the ">" characters)

7.- Execute the following commands:
```
$ yarn codegen
$ yarn build
$ yarn deploy
```

If everything went well you'll have a copy of this subgraph running on your hosted service account.

For deploying any other network please take a look at package.json file entries called deploy:rinkeby and deploy:xdai. Both are refering to different yaml files containing each configuration.

---------

If you have any suggestion about this work feel free to create a task or a pull request with your own changes to be considered. 

Mooooh!
