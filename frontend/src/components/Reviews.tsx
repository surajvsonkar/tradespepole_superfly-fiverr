import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { reviewService } from '../services/reviewService';

const Reviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewService.getRecentReviews();
        if (response.reviews && response.reviews.length > 0) {
          const formattedReviews = response.reviews.map((r: any) => ({
            name: r.homeowner?.name || 'Homeowner',
            location: r.homeowner?.location || 'London',
            rating: r.rating,
            review: r.comment,
            tradesperson: `${r.tradesperson?.name || 'Tradesperson'} - ${r.tradesperson?.trades?.[0] || 'Professional'}`,
            avatar: r.homeowner?.avatar || 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
          }));
          setReviews(formattedReviews);
        } else {
          // Fallback to static reviews if no API reviews found
          setReviews([
            {
              name: 'Rachel Williams',
              location: 'Hampstead',
              rating: 5,
              review: 'Outstanding work! Alex was punctual, professional, and solved our plumbing issue efficiently. Great communication throughout.',
              tradesperson: 'Alex Thompson - Master Plumber',
              avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
            },
            {
              name: 'Tom Harrison',
              location: 'Camden',
              rating: 5,
              review: 'Maya transformed our home with smart lighting. Her expertise and attention to detail were impressive. Highly recommended!',
              tradesperson: 'Maya Patel - Licensed Electrician',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400'
            },
            {
              name: 'Emma Rodriguez',
              location: 'Kensington',
              rating: 5,
              review: 'James delivered exceptional results on our home extension. Professional, reliable, and the quality exceeded expectations.',
              tradesperson: 'James Mitchell - General Contractor',
              avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        // Fallback on error
        setReviews([
            {
              name: 'Rachel Williams',
              location: 'Hampstead',
              rating: 5,
              review: 'Outstanding work! Alex was punctual, professional, and solved our plumbing issue efficiently. Great communication throughout.',
              tradesperson: 'Alex Thompson - Master Plumber',
              avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
            },
            {
              name: 'Tom Harrison',
              location: 'Camden',
              rating: 5,
              review: 'Maya transformed our home with smart lighting. Her expertise and attention to detail were impressive. Highly recommended!',
              tradesperson: 'Maya Patel - Licensed Electrician',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400'
            },
            {
              name: 'Emma Rodriguez',
              location: 'Kensington',
              rating: 5,
              review: 'James delivered exceptional results on our home extension. Professional, reliable, and the quality exceeded expectations.',
              tradesperson: 'James Mitchell - General Contractor',
              avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400'
            }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Client Success Stories
          </h2>
          <p className="text-lg text-gray-600">
            Genuine feedback from homeowners who found their perfect professional
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-gray-300 absolute -top-2 -left-2" />
                  <p className="text-gray-600 italic pl-4">
                    {review.review}
                  </p>
                </div>
                
                <div className="text-sm text-blue-600 font-medium">
                  {review.tradesperson}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4.8</div>
              <div className="flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">Client satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">18K+</div>
              <div className="text-sm text-gray-500">Projects completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">5K+</div>
              <div className="text-sm text-gray-500">Professionals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;