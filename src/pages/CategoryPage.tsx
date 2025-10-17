import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from '@/contexts/TranslationContext';
import heroHealthImage from '@/assets/hero-health-nutrition.jpg';
import heroParentingImage from '@/assets/hero-parenting.jpg';
import heroQuranImage from '@/assets/hero-quran.jpg';
import heroEducationImage from '@/assets/hero-education.jpg';
import heroBabyNamesImage from '@/assets/hero-baby-names.jpg';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';
import { getCategorySlug, selectCategoryPosts } from '@/lib/articleSelection';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const { t, language } = useTranslation();
  
  // Extract category from pathname if not in params
  const getCurrentCategory = () => {
    if (category) return category;
    const path = location.pathname.replace('/', '');
    return path || 'health';
  };
  
  const categoryInfo: Record<string, { title: string; description: string; image: string }> = {
    'parenting': {
      title: t('category.parenting.title'),
      description: t('category.parenting.description'),
      image: heroParentingImage
    },
    'baby-names': {
      title: t('category.baby-names.title'),
      description: t('category.baby-names.description'),
      image: heroBabyNamesImage
    },
    'education': {
      title: t('category.education.title'),
      description: t('category.education.description'),
      image: heroEducationImage
    },
    'quran': {
      title: t('category.quran.title'),
      description: t('category.quran.description'),
      image: heroQuranImage
    }
  };

  const currentCategory = getCurrentCategory();
  const info = categoryInfo[currentCategory] || {
    title: t('category.health.title'),
    description: t('category.health.description'),
    image: heroHealthImage
  };

  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Load all posts regardless of UI language; the UI language only affects labels
      const data = await loadBlogPosts('all');
      if (mounted) setAllPosts(data);
    })();
    return () => {
      mounted = false;
    };
  }, [language]);

  const categoryArticles = useMemo(() => {
    const targetSlug = currentCategory;
    return selectCategoryPosts(allPosts, targetSlug, language);
  }, [allPosts, currentCategory, language]);

  return (
    <Layout>
      {/* Category Header */}
      <div className="bg-aljazeera-blue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">{info.title}</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              {info.description}
            </p>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryArticles.map((article, index) => (
                <ArticleCard
                  key={index}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.image}
                  category={article.category}
                  date={article.date}
                  href={`/articles/${article.slug}`}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;