const { prisma } = require("./src/lib/prisma");

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Raquel",
      email: "teste@email.com",
      password: "123456",
    },
  });

  console.log(user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });