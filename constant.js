const USER_ADDRESS = {
  user1: {
    address: "0x2dAB60fAC0179FbA3dA5ADf99eEaB8AB6973d191",
  },
  user2: {
    address: "0x05A57Ee2722eBd1346d7A44aCDA8e69d06b6128f",
  },
  user3: {
    address: "0x7C547668Fce031482E8948281213322A66769B81",
  },
};

const CONTRACT_ADDRESS = {
  Token71: {
    address: "0xA33DdeC1C406c200ba8E37Fe9918A05c15831A05",
    owner: USER_ADDRESS.user1,
  },
  Token21: {
    address: "0x2F382435930b8A0037B000c4427146fB472Aa9Af",
    owner: USER_ADDRESS.user1,
  },
  AssertExchange: {
    address: "0x12C471d0F3856C0bb69C44ddD87DB2c126336376",
    owner: USER_ADDRESS.user1,
  },
};

module.exports = { USER_ADDRESS, CONTRACT_ADDRESS };
