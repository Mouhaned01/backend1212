const Booking = require('../models/booking.model');
const Car = require('../models/car.model');

module.exports.getDashboardStats = async (req, res) => {
  try {
    const bookingDetailsLog = await Booking.aggregate([
      // 1. Exclude cancelled bookings from active stats
      { $match: { status: { $ne: 'Cancelled' } } },
      
      // 2. Pull customer demographic info (preserved even if null)
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { 
        $unwind: { 
          path: '$userInfo', 
          preserveNullAndEmptyArrays: true 
        } 
      },

      // 3. Gather inventory profile details (supporting both single car reference or array of cars)
      {
        $lookup: {
          from: 'cars',
          let: { carId: '$car', carsArr: '$cars' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', '$$carId'] },
                    { $in: ['$_id', { $ifNull: ['$$carsArr', []] }] }
                  ]
                }
              }
            }
          ],
          as: 'carsInfo'
        }
      },

      // 4. Format timelines and calculate durations
      {
        $project: {
          bookingId: '$_id',
          status: 1,
          customerName: { 
            $cond: {
              if: { $and: ['$userInfo.firstname', '$userInfo.lastname'] },
              then: { $concat: ['$userInfo.firstname', ' ', '$userInfo.lastname'] },
              else: { 
                $ifNull: [
                  '$userInfo.name', 
                  { $ifNull: ['$userInfo.fullName', { $ifNull: ['$clientName', 'Guest Client'] }] }
                ] 
              }
            }
          },
          customerEmail: {
            $ifNull: ['$userInfo.email', { $ifNull: ['$clientEmail', ''] }]
          },
          bookedCars: {
            $ifNull: [
              {
                $map: {
                  input: '$carsInfo',
                  as: 'c',
                  in: { 
                    $ifNull: [
                      '$$c.carName', 
                      { $ifNull: ['$$c.brand', { $ifNull: ['$$c.name', 'Selected Car'] }] }
                    ] 
                  }
                }
              },
              [
                { 
                  $ifNull: [
                    '$carName', 
                    { $ifNull: ['$carBrand', 'Selected Car'] }
                  ] 
                }
              ]
            ]
          },
          carsCount: { $size: { $ifNull: ['$cars', [1]] } },
          totalPrice: 1, 
          totalDays: {
            $ceil: {
              $divide: [
                { $subtract: [{ $toDate: '$endDate' }, { $toDate: '$startDate' }] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },

      // 5. Final project view ensuring all keys are explicit and clean
      {
        $project: {
          _id: 0,
          bookingId: 1,
          status: 1,
          customerName: 1,
          customerEmail: 1,
          bookedCars: 1,
          carName: { $arrayElemAt: ['$bookedCars', 0] },
          carsCount: 1,
          daysBooked: { $cond: { if: { $lte: ['$totalDays', 0] }, then: 1, else: '$totalDays' } },
          totalAmount: '$totalPrice'
        }
      },
      
      { $sort: { bookingId: -1 } }
    ]);

    const totalCarsCount = await Car.countDocuments();
    const activeRevenueSum = bookingDetailsLog.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    return res.status(200).json({ 
      success: true, 
      totalInventoryCars: totalCarsCount,
      globalRevenue: activeRevenueSum,
      activeBookingsLog: bookingDetailsLog
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};