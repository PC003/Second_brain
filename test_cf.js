async function test() {
  const response = await fetch(`https://codeforces.com/api/user.info?handles=invalid_username_that_does_not_exist`);
  console.log(response.status);
  console.log(await response.text());
}
test();
