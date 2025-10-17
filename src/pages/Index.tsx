import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import ArticleGrid from '@/components/ArticleGrid';
import Sidebar from '@/components/Sidebar';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Miftah Som Academy - Health, Parenting, Education & Islamic Studies</title>
        <meta name="description" content="Empowering families with knowledge about health, parenting, education, and Islamic values through evidence-based content and cultural wisdom." />
        <meta property="og:title" content="Miftah Som Academy" />
        <meta property="og:description" content="Health, parenting, education and Quran studies for families." />
      </Helmet>
      {/* Page Title - Hidden visually but important for SEO */}
      <div className="sr-only">
        <h1>Miftah Som Academy - Health, Parenting, Education &amp; Islamic Studies</h1>
      </div>

      {/* Mobile Layout - Al Jazeera Style */}
      <div className="lg:hidden">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Main Articles */}
        <ArticleGrid />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Hero Section - Exact Al Jazeera Layout */}
        <HeroSection />

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex gap-8">
            {/* Main Articles Grid */}
            <div className="flex-1">
              <ArticleGrid />
            </div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden xl:block">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
