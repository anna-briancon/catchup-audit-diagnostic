import pool from "../config/database";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Starting seed...");

  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
      ["test@example.com", hashedPassword, "Utilisateur Test"]
    );

    console.log("Test user created");

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [
      "test@example.com",
    ]);
    const userId = userResult.rows[0].id;

    const eventCount = 5000;
    console.log(`Creating ${eventCount} events...`);

    const locations = [
      "Paris", "Lyon", "Marseille", "Toulouse", "Nice",
      "Nantes", "Bordeaux", "Lille", "Rennes", "Strasbourg"
    ];

    const eventTypes = [
      "Conférence", "Workshop", "Meetup", "Séminaire", "Formation",
      "Webinaire", "Hackathon", "Table ronde", "Networking", "Présentation"
    ];

    const topics = [
      "Tech", "Design", "Business", "Marketing", "Data",
      "AI", "Cloud", "DevOps", "Frontend", "Backend"
    ];

    const statuses = ["upcoming", "ongoing", "completed", "cancelled"];

    const batchSize = 500;
    const batches = Math.ceil(eventCount / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const values: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      const eventsInBatch = Math.min(batchSize, eventCount - batch * batchSize);

      for (let i = 0; i < eventsInBatch; i++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const daysOffset = Math.floor(Math.random() * 365) - 180;
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + daysOffset);

        const maxAttendees = Math.floor(Math.random() * 200) + 20;

        values.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
        );

        params.push(
          userId,
          `${eventType} ${topic} #${batch * batchSize + i + 1}`,
          `Description pour ${eventType.toLowerCase()} sur ${topic}`,
          location,
          eventDate,
          maxAttendees,
          status
        );

        paramIndex += 7;
      }

      await pool.query(
        `INSERT INTO events (organizer_id, title, description, location, event_date, max_attendees, status) 
         VALUES ${values.join(", ")}`,
        params
      );

      console.log(`Batch ${batch + 1}/${batches} completed`);
    }

    console.log(`Successfully created ${eventCount} events`);

    console.log("Creating some RSVPs...");
    const eventIdsResult = await pool.query("SELECT id FROM events LIMIT 100");
    
    for (const event of eventIdsResult.rows) {
      const numRsvps = Math.floor(Math.random() * 10);
      for (let i = 0; i < numRsvps; i++) {
        try {
          await pool.query(
            "INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3)",
            [event.id, userId, "accepted"]
          );
        } catch (e) {
          // Ignore duplicates
        }
      }
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await pool.end();
  }
}

seed();
