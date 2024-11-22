export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-3 text-center">
        <div>
          <h1 className="text-3xl font-semibold text-center my-7">
            About CodeCampus
          </h1>
          <div className="text-md text-gray-500 flex flex-col gap-6">
            <p>
              Welcome to CodeCampus! This platform was created to help college
              students share their interview experiences and learn from each
              other. We believe that real-world experiences can provide valuable
              insights for those preparing for their interviews.
            </p>

            <p>
              On CodeCampus, you'll find posts detailing interview processes,
              questions, and tips from various companies and roles. Whether
              you're preparing for your first job or looking to level up your
              career, the shared knowledge here can guide your journey.
            </p>

            <p>
              We encourage you to contribute your own experiences and engage
              with others' posts. You can comment, like, and reply to
              discussions to foster a supportive community of learners. Let's
              grow together and make interview preparation a collaborative
              effort!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
