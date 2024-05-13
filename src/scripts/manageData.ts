import {
      PrismaClient,
      PRODUCT_CATEGORY,
      USER_ROLE,
      ORDER_STATUS,
    } from "@prisma/client";
    import bcrypt from "bcrypt";

    const prismaForScript = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    async function clearData() {
      const tableNames = [
        "Account",
        "Session",
        "User",
        "VerificationToken",
        "Product",
        "Order",
        "OrderItem",
        "StripeEvent",
        "StripeCustomer",
        "StripeSubscription",
        "Review",
        "Address",
        "PaymentMethod",
      ];

      try {
        for (const tableName of tableNames) {
          await prismaForScript.$executeRawUnsafe(
            `TRUNCATE TABLE "${tableName}" CASCADE;`
          );
        }
        console.log("Data cleared successfully");
      } catch (error) {
        console.error("Error clearing data:", error);
      }
    }

    async function seedData() {
      try {
        const users = await Promise.all([
          createUser(
            "Dr. John Doe",
            "john@hospital.com",
            "password123",
            USER_ROLE.USER
          ),
          createUser(
            "Nurse Jane Smith",
            "jane@hospital.com",
            "password456",
            USER_ROLE.USER
          ),
          createUser(
            "Admin User",
            "admin@hospital.com",
            "adminpass",
            USER_ROLE.ADMIN
          ),
        ]);

        if (users.length < 1) {
          throw new Error(
            "No users created. Cannot proceed with product creation."
          );
        }

        const medicalProducts = {
          [PRODUCT_CATEGORY.DIAGNOSTIC_EQUIPMENT]: [
            {
              name: "Advanced Stethoscope",
              price: 89.99,
              description:
                "High-quality acoustic stethoscope for accurate auscultation",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719706599/gw243_uvilzi.jpg",
            },
            {
              name: "Digital Blood Pressure Monitor",
              price: 59.99,
              description:
                "Automatic blood pressure monitor for home and clinical use",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719706786/a3f0c5eb-f51f-40ee-8cb5-e063693b926f_xofq0k.jpg",
            },
            {
              name: "Pulse Oximeter",
              price: 39.99,
              description:
                "Fingertip pulse oximeter for measuring blood oxygen saturation",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719706903/md300c2e-2_zting0.jpg",
            },
            {
              name: "Infrared Thermometer",
              price: 29.99,
              description:
                "Non-contact infrared thermometer for quick temperature readings",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719706964/forehead-thermometer-infrared-digital-non46301909988_u3hpcg.jpg",
            },
            {
              name: "Digital Otoscope",
              price: 199.99,
              description: "LED otoscope with camera for ear examinations",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719790026/s-l1200_ib56fo.jpg",
            },
            {
              name: "Portable ECG Monitor",
              price: 299.99,
              description: "Compact ECG monitor for heart rhythm analysis",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727108787/s-l1200_smypx0.jpg",
            },
            {
              name: "Handheld Ultrasound Device",
              price: 499.99,
              description:
                "Portable ultrasound system for point-of-care diagnostics",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727108869/image_600x3817_fr0g5d.png",
            },
            {
              name: "Digital Spirometer",
              price: 149.99,
              description: "Portable spirometer for lung function testing",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727108905/Spirolink-Spirometer-Product-01_1200x1200_dk3mmx.png",
            },
            {
              name: "LED Ophthalmoscope",
              price: 249.99,
              description: "Advanced LED ophthalmoscope for eye examinations",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727108926/csm_C-261.28.388-HEINE-Ophthalmoscope-BETA200S-LED-additional_6aef08baef_pobrqh.png",
            },
            {
              name: "Handheld Dermatoscope",
              price: 179.99,
              description: "Digital dermatoscope for skin lesion analysis",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727108964/macquarie_medical_systems_dermlite_dl5_hand_held_dermatoscope_image_hms4m5.jpg",
            },
          ],
          [PRODUCT_CATEGORY.SURGICAL_INSTRUMENTS]: [
            {
              name: "Surgical Scissors Set",
              price: 79.99,
              description:
                "Set of stainless steel surgical scissors for various procedures",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789414/96-2523_2_zuweis.jpg",
            },
            {
              name: "Precision Scalpel Set",
              price: 49.99,
              description: "Set of surgical scalpels with various blade sizes",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789435/13-piece-scalpel-set-5118-sqr_jamhve.jpg",
            },
            {
              name: "Surgical Forceps Collection",
              price: 89.99,
              description: "Assorted surgical forceps for tissue handling",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789454/Nagele-Obstetrical-Forceps_dbq6t6.jpg",
            },
            {
              name: "Basic Retractor Set",
              price: 129.99,
              description: "Essential retractor set for improved surgical access",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789511/31xY6rJ6rUL._AC__mr8if3.jpg",
            },
            {
              name: "Needle Holder Set",
              price: 69.99,
              description: "Set of tungsten carbide needle holders for suturing",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789541/Barraquer-Needle-Holder-2_ntoibh.jpg",
            },
            {
              name: "Electrosurgical Pen",
              price: 199.99,
              description:
                "Precision electrosurgical pen for cutting and coagulation",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109132/cautery-fiab-disposable-f7255-244_no3ghd.jpg",
            },
            {
              name: "LED Surgical Headlight",
              price: 299.99,
              description:
                "Rechargeable LED surgical headlight for hands-free illumination",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109164/Headlight-group_wb5byi.png",
            },
            {
              name: "Portable Suction Pump",
              price: 249.99,
              description:
                "Compact suction pump for fluid removal during procedures",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109204/20210818112934308_gsee8t.jpg",
            },
            {
              name: "Surgical Loupes",
              price: 399.99,
              description: "Magnifying loupes for precision surgical procedures",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109222/surgical_loupes_titanium_right_5_bxvdqr.jpg",
            },
            {
              name: "Orthopedic Drill Set",
              price: 499.99,
              description:
                "Cordless orthopedic drill set for bone and joint procedures",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109235/Mini-Multi-Functional-Bone-Drill-with-Chucks-Medical-Power-Tool-Set-Orthopedic-Surgical-Instruments_mcriwp.jpg",
            },
          ],
          [PRODUCT_CATEGORY.PERSONAL_PROTECTIVE_EQUIPMENT]: [
            {
              name: "N95 Respirator Masks",
              price: 24.99,
              description:
                "Pack of 10 N95 respirator masks for superior protection",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789601/017_diep3k.jpg",
            },
            {
              name: "Disposable Nitrile Gloves",
              price: 14.99,
              description: "Box of 100 disposable nitrile gloves",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789628/Gloves_shutterstock_434003263_700x700_uaicej.jpg",
            },
            {
              name: "Face Shields",
              price: 19.99,
              description: "Pack of 5 full-face protective shields",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789708/06-0125_kddouo.jpg",
            },
            {
              name: "Disposable Isolation Gowns",
              price: 29.99,
              description: "Pack of 10 disposable protective gowns",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789747/image_1024_uztnvz.jpg",
            },
            {
              name: "Protective Shoe Covers",
              price: 9.99,
              description: "Pack of 50 disposable shoe covers",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789764/J0730_y4sbxh.jpg",
            },
            {
              name: "Safety Goggles",
              price: 12.99,
              description: "Anti-fog safety goggles for eye protection",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109344/71Ec3Mzr5lL._AC_UF894_1000_QL80__cdoeyl.jpg",
            },
            {
              name: "Surgical Caps",
              price: 7.99,
              description: "Pack of 50 disposable surgical caps",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109358/B1952xlcX_1024x1024_ij1nvd.jpg",
            },
            {
              name: "Protective Coveralls",
              price: 39.99,
              description: "Full-body protective coverall suit",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109375/tff9623800a-tff9623804e_uwh7zi.jpg",
            },
            {
              name: "Reusable Face Masks",
              price: 16.99,
              description: "Pack of 3 washable cloth face masks",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109397/gray-3m-face-masks-rfm100-10-64_1000_w8dmdp.jpg",
            },
            {
              name: "Hand Sanitizer Dispenser",
              price: 34.99,
              description: "Touchless hand sanitizer dispenser with stand",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109442/EZ-SAN-Manual-Dispenser-Black-700_auxbf8.jpg",
            },
          ],
          [PRODUCT_CATEGORY.PATIENT_CARE_ESSENTIALS]: [
            {
              name: "Adjustable Hospital Bed",
              price: 499.99,
              description: "Electric adjustable hospital bed for patient comfort",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789950/Fully-Adjustable-Electric-Single-Bed-With-5-Settings-7_bidlmd.jpg",
            },
            {
              name: "Wheelchair",
              price: 199.99,
              description: "Foldable wheelchair for patient mobility",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789972/71b28XlzOpL._AC_UF1000_1000_QL80__qawpia.jpg",
            },
            {
              name: "IV Stand",
              price: 79.99,
              description: "Adjustable IV stand with multiple hooks",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719789998/5cecd8ce90a0b_zlzpnv.jpg",
            },
            {
              name: "Vital Signs Monitor",
              price: 399.99,
              description: "Compact vital signs monitor for patient monitoring",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719790026/s-l1200_ib56fo.jpg",
            },
            {
              name: "Overbed Table",
              price: 89.99,
              description: "Adjustable overbed table for patient convenience",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1719790051/51M_Eoyr0VL._AC_UF1000_1000_QL80__ktxzgp.jpg",
            },
            {
              name: "Patient Lift Sling",
              price: 129.99,
              description: "Patient lift sling for safe transfers",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109603/900_uc8nqc.jpg",
            },
            {
              name: "Bedside Commode",
              price: 69.99,
              description: "Portable bedside commode for patient care",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109622/Standard-Bedside-commode_j5m5be.jpg",
            },
            {
              name: "Nebulizer System",
              price: 49.99,
              description: "Compact nebulizer system for respiratory treatments",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109634/BodyMed_CompressorNebulizer_BDMNEBCOM-1000x1000-01_1024x1024_izknhj.jpg",
            },
            {
              name: "Patient Call Button",
              price: 29.99,
              description: "Wireless patient call button for improved care",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109658/617A70Pa9bL._AC_UF894_1000_QL80__flvb98.jpg",
            },
            {
              name: "Pressure Relief Cushion",
              price: 59.99,
              description:
                "Pressure relief cushion for patient comfort and prevention",
              image:
                "https://res.cloudinary.com/di38cp0gv/image/upload/v1727109684/aem420-essential-cushion-2w_vducll.jpg",
            },
          ],
        };

        const products = await Promise.all(
          Object.entries(medicalProducts).flatMap(([category, items]) =>
            items.map((item) =>
              prismaForScript.product.create({
                data: {
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  category: category as PRODUCT_CATEGORY,
                  image: item.image,
                  quantity: Math.floor(Math.random() * 50) + 10,
                  seller: {
                    connect: {
                      id: users[Math.floor(Math.random() * users.length)]?.id,
                    },
                  },
                },
              })
            )
          )
        );

        const addresses = await Promise.all(
          users.map((user) =>
            prismaForScript.address.create({
              data: {
                userId: user.id,
                name: `${user.name}'s Work Address`,
                street: "123 Hospital St",
                city: "Medical City",
                state: "HC",
                zipCode: "12345",
                country: "USA",
                isDefault: true,
              },
            })
          )
        );

        const paymentMethods = await Promise.all(
          users.map((user) =>
            prismaForScript.paymentMethod.create({
              data: {
                userId: user.id,
                type: "Credit Card",
                cardNumber: "4111111111111111",
                nameOnCard: user.name ?? "Unknown",
                expirationDate: "12/2025",
                isDefault: true,
              },
            })
          )
        );

        const orders = await Promise.all(
          users.map((user) => {
            const orderItems = products.slice(0, 3).map((product) => ({
              productId: product.id,
              quantity: Math.floor(Math.random() * 3) + 1,
            }));

            const subtotal = orderItems.reduce((total, item) => {
              const product = products.find((p) => p.id === item.productId);
              return total + (product?.price ?? 0) * item.quantity;
            }, 0);

            const shippingCost = 15;
            const tax = subtotal * 0.08;
            const total = subtotal + shippingCost + tax;

            return prismaForScript.order.create({
              data: {
                userId: user.id,
                status: ORDER_STATUS.DELIVERED,
                addressId: addresses.find((addr) => addr.userId === user.id)?.id,
                paymentMethodId: paymentMethods.find((pm) => pm.userId === user.id)
                  ?.id,
                shippingCost,
                tax,
                total,
                items: {
                  create: orderItems,
                },
              },
            });
          })
        );

        await Promise.all(
          products.map((product) => {
              const randomUser = users[Math.floor(Math.random() * users.length)];
              if (!randomUser) {
                throw new Error("No users available");
              }
            return prismaForScript.review.create({
              data: {
                productId: product.id,
                userId: randomUser.id,
                rating: Math.floor(Math.random() * 5) + 1,
                comment: `This ${
                  product.name
                } is essential for our medical practice. Quality is ${
                  ["excellent", "good", "satisfactory"][
                    Math.floor(Math.random() * 3)
                  ]
                }.`,
              },
            });
          })
        );

        console.log("Data seeded successfully");
        console.log(`Created ${users.length} users`);
        console.log(`Created ${products.length} products`);
        console.log(`Created ${addresses.length} addresses`);
        console.log(`Created ${paymentMethods.length} payment methods`);
        console.log(`Created ${orders.length} orders`);
        console.log(`Created ${products.length} reviews`);
      } catch (error) {
        console.error("Error seeding data:", error);
      }
    }

    async function createUser(
      name: string,
      email: string,
      password: string,
      role: USER_ROLE
    ) {
      const hashedPassword = await bcrypt.hash(password, 12);
      return prismaForScript.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });
    }

    async function main() {
      if (process.argv[2] === "clear") {
        await clearData();
      } else if (process.argv[2] === "seed") {
        await seedData();
      } else {
        console.log('Please specify either "clear" or "seed"');
      }
      await prismaForScript.$disconnect();
    }

    main();
