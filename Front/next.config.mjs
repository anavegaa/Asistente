/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXTAUTH_SECRET:"http://localhost:3000",
      },
};


export default nextConfig;
